var Adoption = artifacts.require("Adoption");
var Weibo = artifacts.require("Weibo");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.link(Adoption,Weibo);
  deployer.deploy(Weibo);
  
};