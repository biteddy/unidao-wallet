const { generateMnemonic, mnemonicToSeed } = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1'); // 确保引入了 ecc
const bitcoin = require('bitcoinjs-lib');

// 创建 bip32 实例
const bip32 = BIP32Factory(ecc);
const network = bitcoin.networks.testnet

const WalletService = {
    async generateMnemonic() {
        return generateMnemonic(128); // 生成16个助记词
    },

    async getSeed(mnemonic) {
        return await mnemonicToSeed(mnemonic);
    },


    async deriveKeys(seed,network) {
        const root = bip32.fromSeed(seed,network); 
        const child = root.derivePath("m/44'/0'/0'/0/0");
        return {
            privateKey: child.privateKey.toString('hex'),
            publicKey: child.publicKey.toString('hex'),
        };
    },
};

// 导出 WalletService 对象
module.exports = WalletService;
