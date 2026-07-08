// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "remix_tests.sol";
import "remix_accounts.sol";
import "contracts/Escrow.sol";

contract EscrowExtendedTest {
    Escrow escrow;
    address payable buyer;
    address payable seller;
    address arbiter;
    address hacker;

    function beforeAll() public {
        buyer = payable(TestsAccounts.getAccount(0));
        seller = payable(TestsAccounts.getAccount(1));
        arbiter = TestsAccounts.getAccount(2);
        hacker = TestsAccounts.getAccount(3);
    }

    // Test 1: Provera ispravne inicijalizacije
    /// #value: 10000000000000000
    function test1_UspesnaInicijalizacija() public payable {
        escrow = new Escrow{value: msg.value}(seller, arbiter);
        
        (,,,uint256 amount, Escrow.State state) = escrow.transaction();
        
        Assert.equal(amount, 10000000000000000, "Ugovor mora imati tacno deponovan iznos");
        Assert.equal(uint(state), 1, "Pocetno stanje mora biti Funded");
    }

    // Test 2: Pokretanje spora od strane prodavca
    // Prvo menjamo nalog na prodavca 
    /// #sender: account-1
    function test2_ProdavacMozePokrenutiSpor() public {
        escrow.raiseDispute();
        
        (,,,, Escrow.State state) = escrow.transaction();
        Assert.equal(uint(state), 3, "Stanje mora preci u InDispute");
    }

    // Test 3: Arbitar resava spor u korist kupca
    /// #sender: account-2
    function test3_ArbitarResavaSporUKoristKupca() public {
        uint256 pocetniBalansKupca = buyer.balance;
        
        escrow.resolveDispute(buyer);
        
        (,,,, Escrow.State state) = escrow.transaction();
        Assert.equal(uint(state), 4, "Stanje mora biti Resolved (Stanje 4)");
        Assert.greaterThan(buyer.balance, pocetniBalansKupca, "Kupac je morao da dobije nazad svoj ETH");
    }
}