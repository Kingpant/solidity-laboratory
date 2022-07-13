pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract KingpantAccessController is AccessControl {
  string public ROOT_OWNER_NAME = "ROOT_OWNER";

  mapping(string => bytes32) public roleBytesByRoleName;

  error InvalidAddress(address caller, address setter);
  error NotRootOwner(address caller);

  event RoleNameAdd(address caller, string roleName);
  event RoleNameRemove(address caller, string roleName);

  constructor(address rootOwner) {
    if (rootOwner == address(0)) {
      revert InvalidAddress(msg.sender, rootOwner);
    }

    roleBytesByRoleName[ROOT_OWNER_NAME] = keccak256(abi.encodePacked(ROOT_OWNER_NAME));

    bytes32 rootOwnerRoleByte = roleBytesByRoleName[ROOT_OWNER_NAME];
    _setupRole(rootOwnerRoleByte, rootOwner);
    _setRoleAdmin(rootOwnerRoleByte, rootOwnerRoleByte);
  }

  function hasRole(string memory roleName, address account) external view returns (bool) {
    return hasRole(roleBytesByRoleName[roleName], account);
  }

  function addRole(string memory roleName) external {
    _onlyRootOwner();

    roleBytesByRoleName[roleName] = keccak256(abi.encodePacked(roleName));

    _setRoleAdmin(roleBytesByRoleName[roleName], roleBytesByRoleName[ROOT_OWNER_NAME]);

    emit RoleNameAdd(msg.sender, roleName);
  }

  function removeRole(string memory roleName) external {
    _onlyRootOwner();

    roleBytesByRoleName[roleName] = bytes32(0);

    _setRoleAdmin(roleBytesByRoleName[roleName], bytes32(0));

    emit RoleNameRemove(msg.sender, roleName);
  }

  function grantRole(string memory roleName, address account)
    external
    onlyRole(getRoleAdmin(roleBytesByRoleName[roleName]))
  {
    _grantRole(roleBytesByRoleName[roleName], account);
  }

  function revokeRole(string memory roleName, address account)
    external
    onlyRole(getRoleAdmin(roleBytesByRoleName[roleName]))
  {
    _revokeRole(roleBytesByRoleName[roleName], account);
  }

  function renounceRole(string memory roleName) external {
    _revokeRole(roleBytesByRoleName[roleName], msg.sender);
  }

  function _onlyRootOwner() private view {
    if (!hasRole(roleBytesByRoleName[ROOT_OWNER_NAME], msg.sender)) {
      revert NotRootOwner(msg.sender);
    }
  }
}
