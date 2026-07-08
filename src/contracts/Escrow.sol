// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
 
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Escrow is ReentrancyGuard {
    
    enum State { Created, Funded, Completed, InDispute, Resolved }
    
    struct Transaction {
        address payable buyer;
        address payable seller;
        address arbiter;
        uint256 amount;
        State currentState;
    }
    
    Transaction public transaction;

    // Dogadjaji
    event FundsDeposited(address buyer, uint256 amount);
    event FundsReleased(address seller, uint256 amount);
    event DisputeRaised(address raiser);
    event DisputeResolved(address winner, uint256 amount);

    // Modifikatori za kontrolu pristupa
    modifier onlyBuyer() {
        require(msg.sender == transaction.buyer, "Samo kupac moze pozvati ovu funkciju");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == transaction.arbiter, "Samo arbitar moze pozvati ovu funkciju");
        _;
    }

    modifier inState(State _state) {
        require(transaction.currentState == _state, "Ugovor nije u ispravnom stanju za ovu akciju");
        _;
    }

    // Kupac deploy-uje ugovor i odmah salje ETH
    constructor(address payable _seller, address _arbiter) payable {
        require(_seller != address(0), "Nevalidna adresa prodavca");
        require(_arbiter != address(0), "Nevalidna adresa arbitra");
        require(msg.value > 0, "Morate deponovati sredstva (ETH)");

        transaction = Transaction({
            buyer: payable(msg.sender),
            seller: _seller,
            arbiter: _arbiter,
            amount: msg.value,
            currentState: State.Funded
        });

        emit FundsDeposited(msg.sender, msg.value);
    }

    // Kupac potvrdjuje da je sve stiglo i oslobadja novac prodavcu
    function releaseFunds() external onlyBuyer inState(State.Funded) nonReentrant {
        transaction.currentState = State.Completed;
        uint256 amount = transaction.amount;
        
        (bool success, ) = transaction.seller.call{value: amount}("");
        require(success, "Isplata prodavcu nije uspela");

        emit FundsReleased(transaction.seller, amount);
    }

    // Kupac ili prodavac moze da pokrene spor ako nesto skrene s puta
    function raiseDispute() external inState(State.Funded) {
        require(msg.sender == transaction.buyer || msg.sender == transaction.seller, "Niste ucesnik u ovoj transakciji");
        transaction.currentState = State.InDispute;
        
        emit DisputeRaised(msg.sender);
    }

    // Arbitar presudjuje u korist jedne od strana 
    function resolveDispute(address payable _winner) external onlyArbiter inState(State.InDispute) nonReentrant {
        require(_winner == transaction.buyer || _winner == transaction.seller, "Pobednik mora biti kupac ili prodavac");
        
        transaction.currentState = State.Resolved;
        uint256 amount = transaction.amount;

        (bool success, ) = _winner.call{value: amount}("");
        require(success, "Isplata pobedniku spora nije uspela");

        emit DisputeResolved(_winner, amount);
    }
}