import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Henakaku Token", () => {
  it ('', async () => {
      const [owner, otherAccount] = await ethers.getSigners();
      const Henkaku = await ethers.getContractFactory("HenkakuToken");
  })
})