import { ethers } from "hardhat";
import { expect } from "chai";
import { KingpantAccessController } from "../typechain-types";

describe("Token contract", () => {
  async function deployKingpantAccessControllerFixture() {
    const KingpantAccessController = await ethers.getContractFactory(
      "KingpantAccessController"
    );
    const [rootOwner, addr1, addr2] = await ethers.getSigners();

    const KingpantAccessControllerSC = <KingpantAccessController>(
      await KingpantAccessController.deploy(rootOwner.address)
    );

    await KingpantAccessControllerSC.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { KingpantAccessControllerSC, rootOwner, addr1, addr2 };
  }

  it("Deployment State Variable", async () => {
    const { KingpantAccessControllerSC, rootOwner } =
      await deployKingpantAccessControllerFixture();

    expect(
      await KingpantAccessControllerSC.roleBytesByRoleName("ROOT_OWNER")
    ).to.equal(ethers.utils.solidityKeccak256(["string"], ["ROOT_OWNER"]));
  });

  describe("addRole", () => {
    it("success", async () => {
      const { KingpantAccessControllerSC, rootOwner } =
        await deployKingpantAccessControllerFixture();

      expect(
        await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER")
      )
        .to.emit(KingpantAccessControllerSC, "RoleNameAdd")
        .withArgs(rootOwner.address, "MINTER");
    });
  });
});
