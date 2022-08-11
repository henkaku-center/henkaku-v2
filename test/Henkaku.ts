import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";

describe("Henakaku Token", () => {
  let owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    funds: SignerWithAddress,
    erc20: Contract;

  beforeEach(async () => {
    [owner, alice, bob, funds] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("HenkakuToken");
    erc20 = await ERC20.connect(owner).deploy();
    await erc20.deployed();
  })

  describe('transfer', () => {
    it('sucessfully transfer', async () => {
      await erc20.addWhitelistUsers([owner.address, alice.address, bob.address])
      await erc20.connect(owner).mint(alice.address, parseUnits('100', 18))

      await expect(
        erc20.connect(alice).transfer(bob.address, 20)
      ).to.changeTokenBalances(erc20, [alice, bob], [-20, 20]);
    })

    it('reverts if receiver is not allowed', async () => {
      await erc20.addWhitelistUsers([owner.address, alice.address])
      await erc20.connect(owner).mint(alice.address, parseUnits('100', 18))

      await expect(
        erc20.connect(alice).transfer(bob.address, 20)
      ).to.be.revertedWith('INVALID: RECEIVER IS NOT ALLOWED')
    })

    context('when unlocked', () => {
      it('sucessfully transfer without allowed list', async () => {
        await erc20.unLock()
        await erc20.connect(owner).mint(alice.address, parseUnits('100', 18))

        await expect(
          erc20.connect(alice).transfer(bob.address, 20)
        ).to.changeTokenBalances(erc20, [alice, bob], [-20, 20]);
      })
    })
  })
})