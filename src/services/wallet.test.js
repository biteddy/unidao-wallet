
// import { mnemonicToSeed } from 'bip39';  
// import { fromSeed } from 'bip32';  

const bitcoin = require('bitcoinjs-lib');
const WalletService = require('./wallet.js'); // 确保路径正确
const {  mnemonicToSeed } = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);

const network = bitcoin.networks.bitcoin;


describe('WalletService', () => {  
    it('should generate a mnemonic', async () => {  
        const mnemonic = await WalletService.generateMnemonic();  
        expect(typeof mnemonic).toBe('string');  
        expect(mnemonic.split(' ').length).toBe(12); // 假设你确实想要12个单词（但注意 generateMnemonic(128) 实际上生成的是16个单词的助记词）  
    });  
  
    it('should convert mnemonic to seed', async () => {  
        const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'; // 使用一个已知的助记词进行测试  
        const seedFromService = await WalletService.getSeed(mnemonic);  
        const seedFromBip39 = await mnemonicToSeed(mnemonic);  
        expect(seedFromService.toString('hex')).toBe(seedFromBip39.toString('hex'));  
    });  
  
    it('should derive keys from seed', async () => {  
        const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'; // 同样使用一个已知的助记词
        const seed = await mnemonicToSeed(mnemonic); 
        const { privateKey, publicKey } = await WalletService.deriveKeys(seed,network);  
  
        const root = bip32.fromSeed(seed);  
        const child = root.derivePath("m/44'/0'/0'/0/0");  
  
        expect(privateKey).toBe(child.privateKey.toString('hex'));  
        expect(publicKey).toBe(child.publicKey.toString('hex'));  
    });  
});