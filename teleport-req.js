/**
 *     Felix's telport request code
 *  Copyright (C) 2023  Felix
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

 // # LetTheBotSpeak
    let allowBotTeleport = false; // Set to false to disable the bot from speaking
    function TeleportListener(data) {
        // Check if the message is of type 'Hidden' and starts with the 'Teleport' command
        if (data.Type === "Hidden" && data.Content.startsWith("Teleport ") && allowBotTeleport == true && ChatRoomData.Admin.includes(data.Sender)) {
            // Extract target player's MemberNumber, x, and y coordinates from the message
            const [target, x, y] = data.Content.replace("Teleport ", "").split(" ");
            
            // Check if the target is the current player
            if (target && target === Player.MemberNumber.toString()) {
                // Ensure x and y are valid numbers
                const xNum = parseInt(x);
                const yNum = parseInt(y);
                if (!isNaN(xNum) && !isNaN(yNum)) {
                    // Check if x and y are within the valid map bounds
                    if (xNum >= 0 && xNum < ChatRoomMapViewWidth && yNum >= 0 && yNum < ChatRoomMapViewHeight) {
                        // Update the player's position on the map
                        Player.MapData.Pos.X = xNum;
                        Player.MapData.Pos.Y = yNum;
                        // Update the map view to reflect the new player position
                        ChatRoomMapViewUpdatePlayerFlag(-ChatRoomMapViewUpdatePlayerTime);
                        
                        // Optional: Log a message to the console or display a message in the chat
                        console.log(`Player teleported to: (${xNum}, ${yNum})`);
                    } else {
                        //console.warn(`Teleport request coordinates out of bounds: (${xNum}, ${yNum})`);
                    }
                } else {
                    //console.warn("Invalid teleport request coordinates:", x, y);
                }
            }
        }
    }
    // Listen for incoming chat room messages and call the TeleportListener function
    ServerSocket.on("ChatRoomMessage", TeleportListener);

function addChatMessage(msg) {
    var div = document.createElement("div");
    div.setAttribute('class', 'ChatMessage ChatMessageWhisper');
    div.setAttribute('data-time', ChatRoomCurrentTime());
    div.setAttribute('data-sender', Player.MemberNumber.toString());
    div.innerHTML = msg;

    var Refocus = document.activeElement.id == "InputChat";
    var ShouldScrollDown = ElementIsScrolledToEnd("TextAreaChatLog");
    if (document.getElementById("TextAreaChatLog") != null) {
        document.getElementById("TextAreaChatLog").appendChild(div);
        if (ShouldScrollDown) ElementScrollToEnd("TextAreaChatLog");
        if (Refocus) ElementFocus("InputChat");
    }
}

// Make the addChatMessage function globally available
window.addChatMessage = addChatMessage;
addChatMessage("Teleport requests loaded and set to disabled by Default.\nUse: /toggletpreq command, to switch between Disabled nad Enabled");

function toggleBool(currentValue) {
    return !currentValue;
}

let TpToggle = [{
    Tag: 'toggletpreq',
    Action: args => {
        if (allowBotTeleport) {
            console.log("Teleport requests disabled.");
            addChatMessage("Teleport requests disabled.");
        } else {
            console.log("Teleport requests enabled.");
            addChatMessage("Teleport requests enabled.");
        }
        allowBotTeleport = toggleBool(allowBotTeleport);
    }
}]
CommandCombine(TpToggle);
