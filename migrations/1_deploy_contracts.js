const CryptoDebitCard = artifacts.require("CryptoDebitCard");

module.exports = function (deployer) {
  deployer.deploy(CryptoDebitCard);
};
