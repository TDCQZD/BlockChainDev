var Voting = artifacts.require('./Voting.sol')

contract('Voting', function (accounts) {
	it("should be able to buy tokens", function () {
		let instance;
		let tokensSold;
		let userTokens;
		return Voting.deployed().then(function (i) {
			instance = i;
			return i.buy({ value: web3.toWei(1, 'ether') });
		}).then(function () {
			return instance.tokensSold.call();
		}).then(function (balance) {
			tokensSold = balance;
			return instance.voterDetails
				.call(web3.eth.accounts[0]);
		}).then(function (tokenDetails) {
			userTokens = tokenDetails[0];
		});
		assert.equal(balance.valueOf(), 100, "100 tokens were not sold");
		assert.equal(userTokens.valueOf(), 100, "100 tokens were not sold");
	});

	it("should be able to vote for candidates", function () {
		var instance;
		return Voting.deployed().then(function (i) {
			instance = i;
			return i.buy({ value: web3.toWei(1, 'ether') });
		}).then(function () {
			return instance.voteForCandidate('Alice', 3);
		}).then(function () {
			return instance.voterDetails
				.call(web3.eth.accounts[0]);
		}).then(function (tokenDetails) {
			assert.equal(tokenDetails[1][0].valueOf(), 3, "3 tokens were not used for voting to Alice");  
		});
	});

})
