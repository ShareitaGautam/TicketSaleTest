Ticket Marketplace

A decentralized ticketing platform built on Ethereum using smart contracts. This system enables users to securely purchase tickets, exchange them with others, or resell them. It leverages event notifications for seamless DApp integration and ensures a transparent and trustworthy ticket management process.

Core Features

Ticket Purchase: Users can acquire tickets at a set price.
Ticket Exchange: Users can propose trades to exchange their tickets with others.
Ticket Resale: Users can list their tickets for resale at a price of their choosing.
Event Notifications: The contract generates events for purchases, exchanges, and resales to facilitate better interaction with decentralized applications.
Technologies Utilized

Solidity: Version 0.8.17 for writing smart contracts.
Ethereum: Contracts deployed on the Ethereum blockchain.
Truffle: A framework for Ethereum-based development.
Ganache: Local Ethereum blockchain for testing and development.
Node.js: A runtime environment for executing scripts and running tests.
Main Functions

purchaseTicket(uint ticketId): Enables users to buy a ticket by specifying its ID.
proposeSwap(uint ticketId): Allows users to propose a ticket swap.
confirmSwap(uint ticketId): Permits users to finalize a proposed swap.
listForResale(uint price): Lets users list their ticket for resale at a custom price.
buyFromResale(uint ticketId): Allows users to purchase a ticket listed for resale.





