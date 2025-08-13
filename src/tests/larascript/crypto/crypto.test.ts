/* eslint-disable no-undef */
import { describe } from '@jest/globals';
import { cryptoService } from '@src/core/services/CryptoService';
import testHelper from '@src/tests/testHelper';



describe('test crypto', () => {

    beforeAll(async () => {
        await testHelper.testBootApp()
    })

    test('test encryption and decryption', async () => {
        const plaintext = 'Hello World';
        
        // Test encryption
        const encrypted = await cryptoService().encrypt(plaintext);
        expect(encrypted).toBeDefined();
        expect(encrypted.includes('|')).toBeTruthy(); // Should contain IV separator
        
        // Test decryption
        const decrypted = await cryptoService().decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
    });

    test('test hashing and verification', async () => {
        const plaintext = 'Hello World';
        
        // Test hashing
        const hashed = await cryptoService().hash(plaintext);
        expect(hashed).toBeDefined();
        expect(hashed.includes('|')).toBeTruthy(); // Should contain salt separator
        
        // Test hash verification
        const isValid = await cryptoService().verifyHash(plaintext, hashed);
        expect(isValid).toBeTruthy();
        
        // Test invalid hash verification
        const isInvalid = await cryptoService().verifyHash('wrong password', hashed);
        expect(isInvalid).toBeFalsy();
    });

    test('encryption produces different ciphertexts for same input', async () => {
        const plaintext = 'Hello World';
        
        const encrypted1 = await cryptoService().encrypt(plaintext);
        const encrypted2 = await cryptoService().encrypt(plaintext);
        
        expect(encrypted1).not.toBe(encrypted2); // Should be different due to random IV
        
        // But both should decrypt to the same plaintext
        const decrypted1 = await cryptoService().decrypt(encrypted1);
        const decrypted2 = await cryptoService().decrypt(encrypted2);
        expect(decrypted1).toBe(decrypted2);
    });

});