import { PostgresConnectionConfig } from "@/knex-adapter/contracts/connectionConfigs.js";
import { KnexConnectionClientBuilder } from "@/knex-adapter/KnexConnectionClientBuilder.js";
import { extractDefaultPostgresCredentials, ParsePostgresConnectionUrl } from "@/postgres-adapter/index.js";
import { postgresDockerComposeFilePath } from "@/tests/common/dockerComposeFilePaths.js";
import { describe, expect, test } from "@jest/globals";
import { Knex } from "knex";

describe("Knex Client", () => {
    let postgresConnectionConfig: PostgresConnectionConfig;
    
    beforeAll(() => {
        const credentials = extractDefaultPostgresCredentials(postgresDockerComposeFilePath());

        if(!credentials) {
            throw new Error('failed to parse postgres connection credentials')
        }

        postgresConnectionConfig = ParsePostgresConnectionUrl.parse(credentials).toObject()
    });

    describe("Postgres Connection Config", () => {
        test("should parse connection config from docker file", () => {
            expect(postgresConnectionConfig.host).toBe('localhost')
            expect(postgresConnectionConfig.port).toBe(5433)
            expect(postgresConnectionConfig.username).toBe('root')
            expect(postgresConnectionConfig.password).toBe('example')
            expect(postgresConnectionConfig.database).toBe('app')
        })
    });

    describe("KnexClient", () => {
        let _knex: Knex;

        beforeEach(() => {
            _knex = KnexConnectionClientBuilder.createPostgresClient(postgresConnectionConfig)
        })

        test("should be able to create a postgres KnexClient", async () => {
            expect(_knex).toBeDefined()
        })
    })

    describe('Basic CRUD Operations', () => {
        let _knex: Knex;
        let tableName: string;

        beforeAll(async () => {
            tableName = "test_table_" + Math.random().toString(36).substring(2, 15);
            _knex = KnexConnectionClientBuilder.createPostgresClient(postgresConnectionConfig)

            const tableExists = await _knex.schema.hasTable(tableName)

            if(tableExists) {
                await _knex.schema.dropTable(tableName)
            }

            await _knex.schema.createTable(tableName, (table) => {
                table.increments('id')
                table.string('name')
                table.integer('age')
            })
        })
        
        afterAll(async () => {
            await _knex.schema.dropTable(tableName)
        })

        test("should be able to able to run some schema/query commands", async () => {

            const tableExists = await _knex.schema.hasTable(tableName)
            expect(tableExists).toBe(true)

            await _knex(tableName).insert([
                {
                    name: 'Bob',
                    age: '30'
                },
                {
                    name: 'Jane',
                    age: '25'
                }
            ])

            const users = await _knex(tableName).select('*').orderBy('id', 'asc')
            expect(users.length).toBe(2)
            expect(users[0].name).toBe('Bob')
            expect(users[0].age).toBe(30)
            expect(users[1]?.name).toBe('Jane')
            expect(users[1]?.age).toBe(25)

            await _knex.delete().from(tableName).where('name', 'Bob')

            const updatedUsers = await _knex(tableName).select('*').orderBy('id', 'asc')
            expect(updatedUsers.length).toBe(1)
            expect(updatedUsers[0]?.name).toBe('Jane')
            expect(updatedUsers[0]?.age).toBe(25)
        })
    })
});
