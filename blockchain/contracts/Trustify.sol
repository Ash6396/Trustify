// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Trustify is ReentrancyGuard {
    struct Campaign {
        address payable creator;
        string title;
        uint256 goalWei;
        uint256 raisedWei;
        bool active;
    }

    Campaign[] private campaigns;

    event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 goalWei);
    event Donated(uint256 indexed campaignId, address indexed donor, uint256 amountWei);
    event Withdrawn(uint256 indexed campaignId, address indexed creator, uint256 amountWei);

    function createCampaign(string calldata title, uint256 goalWei) external returns (uint256 campaignId) {
        require(bytes(title).length >= 3, "title too short");
        require(goalWei > 0, "goal must be > 0");

        campaigns.push(
            Campaign({
                creator: payable(msg.sender),
                title: title,
                goalWei: goalWei,
                raisedWei: 0,
                active: true
            })
        );

        campaignId = campaigns.length - 1;
        emit CampaignCreated(campaignId, msg.sender, title, goalWei);
    }

    function donate(uint256 campaignId) external payable nonReentrant {
        require(campaignId < campaigns.length, "invalid campaign");
        Campaign storage c = campaigns[campaignId];
        require(c.active, "inactive campaign");
        require(msg.value > 0, "donation must be > 0");

        c.raisedWei += msg.value;
        emit Donated(campaignId, msg.sender, msg.value);
    }

    function withdraw(uint256 campaignId) external nonReentrant {
        require(campaignId < campaigns.length, "invalid campaign");
        Campaign storage c = campaigns[campaignId];
        require(c.active, "inactive campaign");
        require(msg.sender == c.creator, "not creator");
        require(c.raisedWei >= c.goalWei, "goal not met");

        uint256 amount = c.raisedWei;
        require(amount > 0, "nothing to withdraw");
        c.raisedWei = 0;
        c.active = false;

        (bool ok, ) = c.creator.call{value: amount}("");
        require(ok, "transfer failed");
        emit Withdrawn(campaignId, msg.sender, amount);
    }

    function getCampaign(uint256 campaignId)
        external
        view
        returns (address creator, string memory title, uint256 goalWei, uint256 raisedWei, bool active)
    {
        require(campaignId < campaigns.length, "invalid campaign");
        Campaign storage c = campaigns[campaignId];
        return (c.creator, c.title, c.goalWei, c.raisedWei, c.active);
    }

    function campaignCount() external view returns (uint256) {
        return campaigns.length;
    }
}
