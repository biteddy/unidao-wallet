/*
*1、//生成加密密钥
*2、加密数据---私钥---
*3、解密数据
*4、保存加密数据到chrome localstorage
*5、从chrome 存储加载并解密数据
*
*/

const encode = require('bitcoinjs-lib');

//password: 用户输入的密码，用于生成加密密钥。
//salt: 随机生成的盐值，用于增强密钥派生的安全性。盐值确保即使两个用户使用相同的密码，生成的密钥也不同。

class KeyStore {
    //构造函数，传入密码，生成盐
	constructor(password){
		this.password=password;
		this.salt =window.crypto.getRandomValues(new Uint8Array(16));
	}
	

	
	/*功能: 从用户的密码和随机生成的盐派生出一个对称密钥，用于AES-GCM加密。
	*算法: 使用PBKDF2算法进行多次迭代（100,000次），提高破解难度。
	*返回值: 返回派生出的AES-GCM密钥。
	*/	
   	//生成加密密钥
	async deriveKey(){
		const encoder = new TextEncoder();
		const keyMaterial = await window.crypto.subtle.importKey(
			'raw',
			encoder.encode(this.password),
			'PBKDF2',
			false,
			['deriveBits','deriveKey']
		);
		
		return window.crypto.subtle.deriveKey(
			{
				name:'PBKDF2',
				salt:this.salt,
				iterations:10000,
				hash:'SHA-256',
			},
			keyMaterial,
			{
				name:'AES-GCM',
				length:256,
			},
			false,
			['encrypt','decrypt']
		);
		
	}
	

	/*功能: 对输入数据进行加密。
	*初始化向量 (IV): 随机生成，用于加密过程以增加安全性。
	*返回值: 返回一个对象，包含IV、盐和加密后的密文。
	*/
   	//加密数据---私钥---
	async encryptData(data){
		const key = await this.deriveKey();
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encoder = new TextEncoder();
		
		const ciphertext= await window.crypto.subtle.encrypt(
			{
				name:'AES-GCM',
				iv:iv,
			},
			key,
			encoder.encode(data)	
		);
		
		return{
			iv:Array.from(iv),
			salt:Array.from(this.salt),
			ciphertext:Array.from(new Uint8Array(ciphertext)),
		};				
	}
	
	/*
	 * 功能: 解密先前加密的数据。
	 * 输入: 加密数据对象（包含IV和密文）。
	 * 返回值: 返回解密后的原始数据。 
	 */
	//解密数据
	async decryptData(encryptData){
		const key = await this.deriveKey();
		const iv = new Uint8Array(encryptData.iv);
		const ciphertext = new Uint8Array(encryptData.ciphertext);
		const decrypteData = await window.crypto.subtle.decrypt(
			{
				name:'AES-GCM',
				iv:iv,
			},
			key,
			ciphertext	
		);
		const decoder = new TextDecoder();
		return decoder.decode(decrypteData);		
	}
	
	
	/*
	*功能: 将加密后的数据保存到Chrome存储中
	*输入: 键名和要保存的原始数据 
	*返回值: 返回Promise，表示数据是否成功保存
	*/
	//保存加密数据到chrome localstorage
	async save(key,value){
		const encryptedValue = await this.encryptData(value);
		return new Promise((resolve)=>{
			chrome.storage.local.set({[key]:encryptedValue},
				()=>{resolve(true); //保存成功
			});
		});
		
	}
	
	/*
	* 功能: 从Chrome存储中加载并解密数据
	* 输入: 要加载的键名
	*返回值: 返回解密后的原始数据或null（如果没有找到数据）
	*/
	// 从chrome 存储加载并解密数据
	async loadData(key){
		return new Promise((resolve)=>{
			chrome.storage.local.get(key,async(result)=>{
				if(result[key]){
					const decryptedValue = await this.decryptData(result[key]);
					resolve(decryptedValue);
				}else{
					resolve(null);
				}		
			});
		});		
	}
			
}
export default KeyStore;
