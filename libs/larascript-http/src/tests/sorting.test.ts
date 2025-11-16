import SortOptions from "@/http/utils/SortOptions.js";
import { describe, expect, test } from "@jest/globals";
import { Request } from "express";
import { TSortDefaults } from "node_modules/@larascript-framework/contracts/dist/http/ISorting.js";

describe("Sorting Test Suite", () => {
  describe("Direction Normalization", () => {
    test("should normalize the direction", () => {
      const value = SortOptions.normalizeDirection('-1')
      expect(value).toBe('desc')

      const value2 = SortOptions.normalizeDirection('1')
      expect(value2).toBe('asc')

      const value3 = SortOptions.normalizeDirection('desc')
      expect(value3).toBe('desc')

      const value4 = SortOptions.normalizeDirection('asc')
      expect(value4).toBe('asc')

      const value5 = SortOptions.normalizeDirection('123')
      expect(value5).toBe('asc')
    })
  });

  test('multiple fields should be normalized', () => {
    const mockRequest = {
        query: {
            sort: {
                name: 'asc',
                age: 'desc'
            }
        }
    } as unknown as Request

    const value = SortOptions.parseRequest(mockRequest)
    
    expect(value.results).toEqual({
      name: 'asc',
      age: 'desc'
    })
  })

  describe('default results', () => {
    test('should create the default results when no sort query is present', () => {
        const mockRequest = {
            query: {}
        } as unknown as Request
    
        const defaultSortOptions: TSortDefaults = {
            defaultField: 'createdAt',
            defaultDirection: 'asc'
        }
    
        const value = SortOptions.parseRequest(mockRequest, defaultSortOptions)
    
        expect(value.results).toEqual({
          createdAt: 'asc'
        })
      })
  })
});
