
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'
import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

let candidates = { "Alice": "candidate-1", "Bob": "candidate-2", "Cary": "candidate-3" }
window.voteForCandidate=function () {
    try {
        let candidateName = $("#candidate").val();
        $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
        $("#candidate").val("");
        Voting.deployed().then(function (contractInstance) {
            contractInstance.voteForCandidate(candidateName,
                {
                    gas: 140000,
                    from: web3.eth.accounts[0]
                })
                .then(function () {
                    let div_id = candidates[candidateName];                    
                    contractInstance.totalVotesFor
                        .call(candidateName).then(function (v) {
                            $("#" + div_id).html(v.toString());
                            $("#msg").html("");
                        });
                });
        });
    } catch (err) {
        console.log(err);
    }
}
$(document).ready(function () {
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source like Metamask")  // Use Mist/MetaMask's provider  
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://39.108.111.144:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)  
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://39.108.111.144:8545"));
    }

    Voting.setProvider(web3.currentProvider);
    let candidateNames = Object.keys(candidates);
    for (var i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i];
        Voting.deployed().then(function (contractInstance) {
            contractInstance.totalVotesFor
                .call(name).then(function (v) {
                    $("#" + candidates[name])
                        .html(v.toString());
                });
        });
    }
});
