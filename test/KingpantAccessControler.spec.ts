import { ethers } from "hardhat";
import { expect } from "chai";
import { KingpantAccessController } from "../typechain-types";

const rootOwnerByte = ethers.utils.solidityKeccak256(
  ["string"],
  ["ROOT_OWNER"]
);

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
    return {
      KingpantAccessController,
      KingpantAccessControllerSC,
      rootOwner,
      addr1,
      addr2,
    };
  }

  describe("Deployment State Variable", async () => {
    it("failed, caller is not owner", async () => {
      const { KingpantAccessController, KingpantAccessControllerSC } =
        await deployKingpantAccessControllerFixture();

      await expect(
        KingpantAccessController.deploy(ethers.constants.AddressZero)
      )
        .to.revertedWithCustomError(
          KingpantAccessControllerSC,
          "InvalidAddress"
        )
        .withArgs(ethers.constants.AddressZero);
    });

    it("success", async () => {
      const { KingpantAccessControllerSC } =
        await deployKingpantAccessControllerFixture();

      expect(
        await KingpantAccessControllerSC.roleBytesByRoleName("ROOT_OWNER")
      ).to.equal(rootOwnerByte);
    });
  });

  describe("addRole", () => {
    it("failed, caller is not owner", async () => {
      const { KingpantAccessControllerSC, addr1 } =
        await deployKingpantAccessControllerFixture();

      await expect(KingpantAccessControllerSC.connect(addr1).addRole("MINTER"))
        .to.revertedWithCustomError(KingpantAccessControllerSC, "NotRootOwner")
        .withArgs(addr1.address);
    });

    it("failed, exist role name", async () => {
      const { KingpantAccessControllerSC, rootOwner } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await expect(
        KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER")
      ).to.revertedWithCustomError(KingpantAccessControllerSC, "ExistRoleName");
    });

    it("success", async () => {
      const { KingpantAccessControllerSC, rootOwner } =
        await deployKingpantAccessControllerFixture();

      await expect(
        KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER")
      )
        .to.emit(KingpantAccessControllerSC, "RoleNameAdd")
        .withArgs(rootOwner.address, "MINTER");
    });
  });

  describe("removeRole", () => {
    it("failed, caller is not owner", async () => {
      const { KingpantAccessControllerSC, addr1 } =
        await deployKingpantAccessControllerFixture();

      await expect(
        KingpantAccessControllerSC.connect(addr1).removeRole("MINTER")
      )
        .to.revertedWithCustomError(KingpantAccessControllerSC, "NotRootOwner")
        .withArgs(addr1.address);
    });

    it("failed, not exist role name", async () => {
      const { KingpantAccessControllerSC, rootOwner, addr1 } =
        await deployKingpantAccessControllerFixture();

      await expect(
        KingpantAccessControllerSC.connect(rootOwner).removeRole("MINTER")
      ).to.revertedWithCustomError(
        KingpantAccessControllerSC,
        "NotExistRoleName"
      );
    });

    it("success", async () => {
      const { KingpantAccessControllerSC, rootOwner } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await expect(
        KingpantAccessControllerSC.connect(rootOwner).removeRole("MINTER")
      )
        .to.emit(KingpantAccessControllerSC, "RoleNameRemove")
        .withArgs(rootOwner.address, "MINTER");
    });
  });

  describe("grantRole", () => {
    it("failed, caller is not admin", async () => {
      const { KingpantAccessControllerSC, rootOwner, addr1 } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await expect(
        KingpantAccessControllerSC.connect(addr1)["grantRole(string,address)"](
          "MINTER",
          addr1.address
        )
      ).to.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${rootOwnerByte}`
      );
    });

    it("success", async () => {
      const { KingpantAccessControllerSC, rootOwner, addr1 } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await expect(
        KingpantAccessControllerSC.connect(rootOwner)[
          "grantRole(string,address)"
        ]("MINTER", addr1.address)
      )
        .to.emit(KingpantAccessControllerSC, "RoleGranted")
        .withArgs(
          ethers.utils.solidityKeccak256(["string"], ["MINTER"]),
          addr1.address,
          rootOwner.address
        );

      expect(
        await KingpantAccessControllerSC["hasRole(string,address)"](
          "MINTER",
          addr1.address
        )
      ).to.equal(true);
    });
  });

  describe("revokeRole", () => {
    it("failed, caller is not admin", async () => {
      const { KingpantAccessControllerSC, rootOwner, addr1 } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await expect(
        KingpantAccessControllerSC.connect(addr1)["revokeRole(string,address)"](
          "MINTER",
          addr1.address
        )
      ).to.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${rootOwnerByte}`
      );
    });

    it("success", async () => {
      const { KingpantAccessControllerSC, rootOwner, addr1 } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await KingpantAccessControllerSC.connect(rootOwner)[
        "grantRole(string,address)"
      ]("MINTER", addr1.address);

      await expect(
        KingpantAccessControllerSC.connect(rootOwner)[
          "revokeRole(string,address)"
        ]("MINTER", addr1.address)
      )
        .to.emit(KingpantAccessControllerSC, "RoleRevoked")
        .withArgs(
          ethers.utils.solidityKeccak256(["string"], ["MINTER"]),
          addr1.address,
          rootOwner.address
        );

      expect(
        await KingpantAccessControllerSC["hasRole(string,address)"](
          "MINTER",
          addr1.address
        )
      ).to.equal(false);
    });
  });

  describe("renounceRole", () => {
    it("success", async () => {
      const { KingpantAccessControllerSC, rootOwner, addr1 } =
        await deployKingpantAccessControllerFixture();

      await KingpantAccessControllerSC.connect(rootOwner).addRole("MINTER");

      await KingpantAccessControllerSC.connect(rootOwner)[
        "grantRole(string,address)"
      ]("MINTER", addr1.address);

      await expect(
        KingpantAccessControllerSC.connect(addr1)["renounceRole(string)"](
          "MINTER"
        )
      )
        .to.emit(KingpantAccessControllerSC, "RoleRevoked")
        .withArgs(
          ethers.utils.solidityKeccak256(["string"], ["MINTER"]),
          addr1.address,
          addr1.address
        );

      expect(
        await KingpantAccessControllerSC["hasRole(string,address)"](
          "MINTER",
          addr1.address
        )
      ).to.equal(false);
    });
  });
});
