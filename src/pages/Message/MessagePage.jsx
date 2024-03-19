import ChatListComponent from "../../components/MessageComponents.jsx/ChatListComponent"
import MessageContainer from "../../components/MessageComponents.jsx/MessageContainerComponent"
import { Container } from 'react-bootstrap';
import './MessagePage.css'
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getUserInformationById } from "../../services/users";
import NavbarComponent from "../../components/Navbar/NavbarComponent";
import { getAllMessagesByUserId } from "../../services/messages";
import io from "socket.io-client";
const socket = io("http://localhost:5001");
import { useUser } from '../../context/UserContext.jsx';

export const MessagePage = () => {
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [receiverDetails, setReceiverDetails] = useState(null);
    const [user_id, setuserID] = useState(window.localStorage.getItem("user_id"));
    const [token, setToken] = useState(window.localStorage.getItem("token"));
    const [receiptID, setreceiptID] = useState()
    const [newUserName, setNewUserName] = useState()
    const [myRoomIdentifier, setMyRoomIdentifier] = useState()
    const { userData, refreshUserData } = useUser();

    // help_offer_user_id passed from StartChatButton
    const location = useLocation();
    const help_offer_user_id = location.state?.help_offer_user_id;

    useEffect(() => {
      const fetchUserDetails = async () => {
        try {
          const userData = await getUserInformationById(user_id);
          setUserDetails(userData);
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      };

      const fetchMessagesAndDetails = async () => {
        try {
          const allMessages = await getAllMessagesByUserId(user_id, token);
          setMessages(allMessages);

          if (help_offer_user_id) {
            const helpOfferDetails = await getUserInformationById(help_offer_user_id);
            setReceiverDetails(helpOfferDetails);
          }
        } catch (error) {
          console.error("Error fetching messages or user details:", error);
        }
      };

      fetchUserDetails();
      fetchMessagesAndDetails();
    }, [user_id, help_offer_user_id, token]);

    function getRoomIdentifier(userId1, userId2) {
      return [userId1, userId2].sort((a, b) => a - b).join('_');
    }

    const handleChatSelect = async (selectedMessage) => {
      
 
      setSelectedMessageId(selectedMessage)
      // console.log(selectedMessage)
      const newRecipientId = selectedMessage.sender_id == user_id ? selectedMessage.recipient_id : selectedMessage.sender_id;
      const newUserName = selectedMessage.sender_id == user_id ? selectedMessage.receiver_username : selectedMessage.sender_username;
      setreceiptID(newRecipientId)
      setNewUserName(newUserName)
      
      const roomIdentifier = getRoomIdentifier(user_id, newRecipientId);
 
      setMyRoomIdentifier(roomIdentifier)
 

    };


    return (
      <>
          <NavbarComponent userDetails={userData}  refeshUserData={refreshUserData}  />
        <Container className="message-page-container">
            <ChatListComponent onChatSelect={handleChatSelect} allMessages={messages} receiverDetails={receiverDetails} userDetails={userDetails} />
            {selectedMessageId && <MessageContainer messageManager={selectedMessageId} myRoomIdentifier={myRoomIdentifier} newUserName={newUserName} newRecipientId={receiptID}  userDetails={userDetails}  receiverDetails={receiverDetails} />}
      </Container>
      </>
    )
}