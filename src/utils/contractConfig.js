import web3 from './web3';
import CryptoDebitCardABI from '../contracts/CryptoDebitCard.json';

// Get this address from truffle migrate output
const contractAddress = '0xf5EB38515B8292464da6c0Baf14D5218a7A3B4a5'; 

// Debug logging
console.log('Contract Configuration:');
console.log('Network ID:', web3.eth.net.getId());
console.log('Contract Address:', contractAddress);
console.log('ABI:', CryptoDebitCardABI.abi);

const cryptoDebitCard = new web3.eth.Contract(
    CryptoDebitCardABI.abi,
    contractAddress
);

// Verify contract initialization
console.log('Contract instance:', cryptoDebitCard);

// Function to verify contract connection
export const verifyContract = async () => {
    try {
        // Try to call a view function from your contract
        const owner = await cryptoDebitCard.methods.owner().call();
        console.log('Contract connected successfully! Owner:', owner);
        return true;
    } catch (error) {
        console.error('Contract connection failed:', error);
        return false;
    }
};

export default cryptoDebitCard;
