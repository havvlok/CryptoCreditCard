// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CryptoDebitCard is Ownable, ReentrancyGuard, Pausable {
    uint256 public constant ETH_USD_PRICE = 3000; // $3000 USD

    struct UserAccount {
        uint256 fiatBalance;    // Balance in dollars (USD)
        address userAddress;
    }

    mapping(address => UserAccount) public users;

    event BalanceUpdated(address indexed userAddress, uint256 newFiatBalance, uint256 newCryptoBalance);
    event CryptoDeposited(address indexed userAddress, uint256 cryptoAmount, uint256 fiatAmount);
    event CryptoWithdrawn(address indexed userAddress, uint256 cryptoAmount, uint256 fiatAmount);

    constructor() Ownable(msg.sender) {}

    function getUserDetails() external view returns (
        address userAddress,
        uint256 fiatBalance,
        uint256 cryptoBalance
    ) {
        return (
            msg.sender,
            users[msg.sender].fiatBalance,
            address(msg.sender).balance
        );
    }

    function calculateRequiredWei(uint256 _dollarAmount) public pure returns (uint256) {
        return (_dollarAmount * 1e18) / ETH_USD_PRICE;
    }

    function depositCrypto(uint256 _dollarAmount) external payable whenNotPaused nonReentrant {
        require(_dollarAmount > 0, "Amount must be greater than 0");
        
        uint256 requiredWei = (_dollarAmount * 1e18) / ETH_USD_PRICE;
        require(msg.value == requiredWei, "Incorrect ETH amount sent");

        users[msg.sender].fiatBalance += _dollarAmount;

        emit CryptoDeposited(msg.sender, msg.value, _dollarAmount);
        emit BalanceUpdated(msg.sender, users[msg.sender].fiatBalance, address(msg.sender).balance);
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawCrypto(uint256 _dollarAmount) external whenNotPaused nonReentrant {
        require(_dollarAmount > 0, "Amount must be greater than 0");
        require(users[msg.sender].fiatBalance >= _dollarAmount, "Insufficient fiat balance");

        // Calculate ETH amount to send
        uint256 weiToSend = (_dollarAmount * 1e18) / ETH_USD_PRICE;
        
        // Check if contract has enough balance
        require(address(this).balance >= weiToSend, "Insufficient contract balance");

        // Update fiat balance before transfer to prevent reentrancy
        users[msg.sender].fiatBalance -= _dollarAmount;

        // Transfer ETH to user
        (bool success, ) = payable(msg.sender).call{value: weiToSend}("");
        require(success, "ETH transfer failed");

        emit CryptoWithdrawn(msg.sender, weiToSend, _dollarAmount);
        emit BalanceUpdated(msg.sender, users[msg.sender].fiatBalance, address(msg.sender).balance);
    }
}
