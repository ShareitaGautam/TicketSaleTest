const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require("../scripts/compile");

let accounts;
let ticketSale;
const TICKET_PRICE = web3.utils.toWei("0.01", "ether");
const NUM_TICKETS = 100;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  ticketSale = await new web3.eth.Contract(abi)
    .deploy({
      data: bytecode,
      arguments: [NUM_TICKETS, TICKET_PRICE],
    })
    .send({ from: accounts[0], gas: "3000000" });
});

describe("TicketSale Contract", () => {
  // Test 1: Contract Deployment
  it("should deploy successfully", () => {
    assert.ok(ticketSale.options.address);
  });

  // Test 2: Ticket Purchase
  describe("ticket buying process", () => {
    it("should allow a user to purchase a ticket", async () => {
      await ticketSale.methods.buyTicket(1).send({
        from: accounts[1],
        value: TICKET_PRICE,
        gas: "3000000",
      });
      const ticketOwner = await ticketSale.methods.getTicketOf(accounts[1]).call();
      assert.equal(ticketOwner, "1");
    });
  });

  // Test 3: Ticket Swapping
  describe("ticket swapping functionality", () => {
    it("should enable ticket swapping between users", async () => {
      await ticketSale.methods.buyTicket(1).send({
        from: accounts[1],
        value: TICKET_PRICE,
        gas: "3000000",
      });

      await ticketSale.methods.buyTicket(2).send({
        from: accounts[2],
        value: TICKET_PRICE,
        gas: "3000000",
      });

      await ticketSale.methods.offerSwap(2).send({
        from: accounts[1],
        gas: "3000000",
      });

      await ticketSale.methods.acceptSwap(1).send({
        from: accounts[2],
        gas: "3000000",
      });

      const newOwner1 = await ticketSale.methods.getTicketOf(accounts[2]).call();
      const newOwner2 = await ticketSale.methods.getTicketOf(accounts[1]).call();

      assert.equal(newOwner1, "1");
      assert.equal(newOwner2, "2");
    });
  });

  // Test 4: Ticket Resale
  describe("ticket resale mechanism", () => {
    it("should handle the entire resale process correctly", async () => {
      await ticketSale.methods.buyTicket(1).send({
        from: accounts[1],
        value: TICKET_PRICE,
        gas: "3000000",
      });

      const resalePrice = web3.utils.toWei("0.02", "ether");
      await ticketSale.methods.resaleTicket(resalePrice).send({
        from: accounts[1],
        gas: "3000000",
      });

      const resaleTickets = await ticketSale.methods.checkResale().call();
      assert.equal(resaleTickets[0], "1");

      const initialBalance = await web3.eth.getBalance(accounts[1]);
      await ticketSale.methods.acceptResale(1).send({
        from: accounts[2],
        value: resalePrice,
        gas: "3000000",
      });

      const newOwner = await ticketSale.methods.getTicketOf(accounts[2]).call();
      assert.equal(newOwner, "1");
    });
  });

  // Test 5: Service Fee Calculation
  describe("service fee implementation", () => {
    it("should calculate and distribute the service fee properly", async () => {
      const initialManagerBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[0])
      );

      await ticketSale.methods.buyTicket(1).send({
        from: accounts[1],
        value: TICKET_PRICE,
        gas: "3000000",
      });

      const resalePrice = web3.utils.toWei("0.02", "ether");
      await ticketSale.methods.resaleTicket(resalePrice).send({
        from: accounts[1],
        gas: "3000000",
      });

      await ticketSale.methods.acceptResale(1).send({
        from: accounts[2],
        value: resalePrice,
        gas: "3000000",
      });

      const finalManagerBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[0])
      );
      const expectedFee = web3.utils.toBN(resalePrice).div(web3.utils.toBN(10));
      const actualFee = finalManagerBalance.sub(initialManagerBalance);

      assert(
        actualFee.gte(expectedFee),
        "Service fee was not distributed correctly to the manager"
      );
    });
  });
});
