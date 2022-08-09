// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HenkakuToken is ERC20, Ownable{
    uint256 private maxSupply = 1_000_000_000e18; // 1 billion henkaku

    constructor() ERC20("Henkaku", "HENKAKU") {
    }

    function mint(address _to, uint256 amount) public onlyOwner {
        require(maxSupply <= (totalSupply() + amount), 'EXCEED MAX SUPPLY');
        _mint(_to, amount);
    }

    function burn(address _of, uint256 amount) public onlyOwner {
        _burn(_of, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override virtual {
        // check msg.sender is in whitelist or not
    }
}
