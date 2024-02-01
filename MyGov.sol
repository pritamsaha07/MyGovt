// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.5.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.5.0/contracts/access/Ownable.sol";

contract MyGovernanceToken is ERC20, Ownable {
    uint256 public constant VOTING_DURATION = 7 days; 
    

    struct Proposal {
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        bool executed;
        bool cancelled;
    }

    mapping(address => Proposal) public proposals;
    mapping(address => bool) public hasVoted;

    event ProposalCreated(address indexed id, address indexed proposer, string description);
    event Voted(address indexed id, address indexed voter, bool support);
    event ProposalExecuted(address indexed id);
    event ProposalCancelled(address indexed id);

    constructor() ERC20("MyGovernanceToken", "MGT") {
        _mint(msg.sender, 50 * 10**18);
    }

    function createProposal(string memory _description) external {
        require(balanceOf(msg.sender) > 0, "Insufficient balance to create a proposal");
        require(!hasVoted[msg.sender], "Address has an active vote");

        proposals[msg.sender] = Proposal({
            proposer: msg.sender,
            description: _description,
            forVotes: 0,
            againstVotes: 0,
            startTime: block.timestamp,
            executed: false,
            cancelled: false
        });

        emit ProposalCreated(msg.sender, msg.sender, _description);
    }
        

    function vote(address _id, bool _support) external {
        require(!hasVoted[_id], "Address has already voted");

        Proposal storage proposal = proposals[_id];

        require(!proposal.cancelled, "Proposal has been cancelled");
        require(block.timestamp < proposal.startTime + VOTING_DURATION, "Voting has ended");

        if (_support) {
            proposal.forVotes += balanceOf(_id);
        } else {
            proposal.againstVotes += balanceOf(_id);
        }

        hasVoted[_id] = true;

        emit Voted(_id, _id, _support);
    }

    function cancelProposal(address _id) external onlyOwner {
        Proposal storage proposal = proposals[_id];

        require(msg.sender == proposal.proposer, "You are not the proposer");
        require(!proposal.cancelled, "Proposal has already been cancelled");
        require(!proposal.executed, "Proposal has already been executed");
        require(block.timestamp < proposal.startTime + VOTING_DURATION, "Voting has started");

        proposal.cancelled = true;

        emit ProposalCancelled(_id);
    }

    function executeProposal(address _id) external onlyOwner {
        Proposal storage proposal = proposals[_id];

        require(!proposal.cancelled, "Proposal has been cancelled");
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp >= proposal.startTime + VOTING_DURATION, "Voting still ongoing");

        if (proposal.forVotes > proposal.againstVotes) {
            proposal.executed = true;

            emit ProposalExecuted(_id);
        }
    }
}
