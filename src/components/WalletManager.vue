<template>
  <div>
    <button @click="generateWallet">生成钱包</button>
    <button @click="loadWallet">加载钱包</button>
    <p v-if="mnemonic">助记词: {{ mnemonic }}</p>
  </div>
</template>

<script>
import { generateMnemonic } from 'bip39'; // 引入bip39库
import KeyStore from '../services/keystore';

export default {
  data() {
    return {
      mnemonic: '',
      keyStore: null,
    };
  },
  created() {
    this.keyStore = new KeyStore('your-secure-password'); // 使用安全密码初始化KeyStore
  },
  methods: {
    async generateWallet() {
      this.mnemonic = await generateMnemonic(128); // 生成助记词
      await this.keyStore.saveData('mnemonic', this.mnemonic); // 保存助记词
    },
    async loadWallet() {
      const loadedMnemonic = await this.keyStore.loadData('mnemonic'); // 加载助记词
      this.mnemonic = loadedMnemonic || '没有找到助记词';
    },
  },
};
</script>