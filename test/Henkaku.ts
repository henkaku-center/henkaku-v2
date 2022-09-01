import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { constants, Contract } from "ethers";
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

  describe('addWhitelistUsers', () => {
    it('sucessfully add whitelist users', async () => {
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)

      await erc20.addWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)
      expect(await erc20.isAllowed(alice.address)).to.be.eq(true)
      expect(await erc20.isAllowed(bob.address)).to.be.eq(true)
    })

    it('sucessfully add whitelist user', async () => {
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)
      await erc20.addWhitelistUser(owner.address)
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)
    })

    it('reverts if user do not have permission', async () => {
      await expect(
        erc20.connect(alice).addWhitelistUsers([owner.address, alice.address, bob.address])
      ).to.be.revertedWith("INVALID: ONLY ADMIN CAN EXECUTE")
    })

    it('sucessfully addwhitelist user if users is gatekeeper', async () => {
      await erc20.setGateKeeper(alice.address)
      await erc20.connect(alice).addWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)
    })

    it('sucessfully addwhitelist user if users is dev', async () => {
      await erc20.setDevAddress(bob.address)
      await erc20.connect(bob).addWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)
    })
  })

  describe('removeWhitelistUsers', () => {
    it('sucessfully remove whitelist users', async () => {
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)

      await erc20.addWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)

      await erc20.removeWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)
      expect(await erc20.isAllowed(alice.address)).to.be.eq(false)
      expect(await erc20.isAllowed(bob.address)).to.be.eq(false)
    })

    it('successfully remove whitelist user', async () => {
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)
      await erc20.addWhitelistUser(owner.address)
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)

      await erc20.removeWhitelistUser(owner.address)
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)
    })

    it('reverts if user do not have permission', async () => {
      await expect(
        erc20.connect(alice).removeWhitelistUsers([owner.address, alice.address, bob.address])
      ).to.be.revertedWith("INVALID: ONLY ADMIN CAN EXECUTE")
    })

    it('successfully remove whitelist user if users is gatekeeper', async () => {
      await erc20.setGateKeeper(alice.address)
      await erc20.connect(alice).addWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)

      await erc20.connect(alice).removeWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)
    })

    it('successfully remove whitelist user if users is dev', async () => {
      await erc20.setDevAddress(bob.address)
      await erc20.connect(bob).addWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(true)

      await erc20.connect(bob).removeWhitelistUsers([owner.address, alice.address, bob.address])
      expect(await erc20.isAllowed(owner.address)).to.be.eq(false)
    })
  })

  describe('burn', () => {
    beforeEach(async () => {
      await erc20.addWhitelistUsers([owner.address, alice.address, bob.address, constants.AddressZero])
      await erc20.connect(owner).mint(alice.address, parseUnits('100', 18))
    })

    it('successfully burn', async () => {
      await expect(
        erc20.burn(alice.address, 20)
      ).to.changeTokenBalances(erc20, [alice], [-20]);
    })

    it('successfully burn if users burn their token', async () => {
      await expect(
        erc20.connect(alice).burn(alice.address, 20)
      ).to.changeTokenBalances(erc20, [alice], [-20]);
    })

    it('reverts if users burn someones token', async () => {
      await expect(
        erc20.connect(alice).burn(owner.address, 20)
      ).to.be.revertedWith('INVALID: NOT YOUR ASSET')
    })
  })

})
