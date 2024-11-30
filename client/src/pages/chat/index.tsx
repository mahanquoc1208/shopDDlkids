import React, { useEffect, useState, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import { fetchAllChatbot, getChatMessages, addchatleader } from '../../api/post/post.api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ChatApp = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const chatContainerRef = useRef(null);
    const pollingInterval = useRef(null);

    const getChatbots = async () => {
        try {
            const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
            const response = await fetchAllChatbot();
            console.log("API response from fetchAllChatbot:", response.data);
    
            const uniqueContacts = Array.from(new Set(response.data.map(contact => contact.fullName || contact.email)))
                .map(name => response.data.find(contact => (contact.fullName || contact.email) === name));
    
                for (let contact of uniqueContacts) {
                    const messages = await getChatMessages(contact.name);
                    console.log(`Messages for ${contact.name}:`, messages.data);
                
                    if (messages.data.length > 0) {
                        const lastMessage = messages.data[messages.data.length - 1];
                            contact.latestMessage = lastMessage.userID 
                                ? `Bạn: ${lastMessage.content}`
                                : lastMessage.content;
                            contact.latestMessageCreatedAt = lastMessage.createdAt;
                
                        // Calculate unread count, excluding messages sent by the current user
                        const lastSeenTimestamp = localStorage.getItem(`lastSeen_${contact.name}`) || 0;
                        contact.unreadCount = messages.data.filter(
                            message => message.userID !== currentUserID && new Date(message.createdAt) > new Date(lastSeenTimestamp)
                        ).length;
                    } else {
                        contact.latestMessage = 'No messages yet';
                        contact.latestMessageCreatedAt = null;
                        contact.unreadCount = 0;
                    }
                }
                
    
            const sortedContacts = uniqueContacts.sort((a, b) => {
                const dateA = a.latestMessageCreatedAt ? new Date(a.latestMessageCreatedAt) : new Date(0);
                const dateB = b.latestMessageCreatedAt ? new Date(b.latestMessageCreatedAt) : new Date(0);
                return dateB - dateA;
            });
    
            setContacts(sortedContacts);
            setFilteredContacts(sortedContacts);
        } catch (error) {
            console.error("Failed to fetch chatbots:", error);
        }
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            getChatbots();
        }, 3000);

        // Dọn dẹp interval khi component bị unmount
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        if (activeContact) {
            pollingInterval.current = setInterval(fetchMessages, 3000);
        } else if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }

        return () => clearInterval(pollingInterval.current);
    }, [activeContact]);

    useEffect(() => {
        const filtered = contacts.filter(contact =>
            (contact.fullName && contact.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredContacts(filtered);
    }, [searchTerm, contacts]);

    const fetchMessages = async (contact) => {
        const currentContact = contact || activeContact;
        if (!currentContact) return;
    
        try {
            const messages = await getChatMessages(currentContact.name);
            setChatMessages(messages.data);
        } catch (error) {
            console.error("Failed to fetch chat messages:", error);
        }
    };

    const handleContactClick = async (contact) => {
        setActiveContact(contact);
        localStorage.setItem(`lastSeen_${contact.name}`, new Date().toISOString());
        await fetchMessages(contact);
    };

const handleSendMessage = async () => {
    const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id);
    if (!messageContent.trim() || !activeContact) return;
    
    const messageData = {
        userID: currentUserID,
        content: messageContent,
        name: activeContact.name,
        createdAt: new Date()
    };
    
    try {
        // Send the message
        await addchatleader(messageData);
        
        // Update the chatMessages in the current state
        setChatMessages([...chatMessages, messageData]);
        setMessageContent('');
        
        // Fetch messages for the active contact
        await fetchMessages(activeContact);
        
        // Call getChatbots to update contacts and their latest messages
        await getChatbots();
    } catch (error) {
        console.error("Failed to send message:", error);
    }
};

    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-[92vh] bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
                <div className="p-4 border-b border-gray-300">
                    <input
                        className="w-full p-2 border rounded-md"
                        placeholder="Tìm kiếm"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="p-4">
                    <div className="space-y-4">
                        {/* Contact List */}
                        {filteredContacts.map((contact, index) => (
                            <div className="relative">
                            <div className={`flex items-center space-x-2 cursor-pointer ${activeContact === contact ? 'font-semibold bg-blue-100' : 'hover:bg-gray-200'}`}
                                onClick={() => handleContactClick(contact)}
                            >
                                <img alt="User avatar" className="w-10 h-10 rounded-full" src="https://storage.googleapis.com/a1aa/image/7fKGeJGsiRkBJEZPlnzKlpe5frwkfW39QPrGlQI9dWSFTgqdC.jpg" />
                                <div>
                                    <div className="font-semibold">{contact.fullName || contact.email}</div>
                                    <div className="text-sm text-gray-500">
                                        {contact.latestMessage.length > 50 
                                            ? `${contact.latestMessage.slice(0, 50)}...` 
                                            : contact.latestMessage}
                                    </div>
                                </div>
                            </div>
                            {contact.unreadCount > 0 && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {contact.unreadCount}
                                </div>
                            )}
                        </div>
                        
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-300">
                    {activeContact ? (
                        <div className="flex items-center space-x-2">
                            <img alt="User avatar" className="w-10 h-10 rounded-full" src="https://storage.googleapis.com/a1aa/image/7fKGeJGsiRkBJEZPlnzKlpe5frwkfW39QPrGlQI9dWSFTgqdC.jpg" />
                            <div className="font-semibold">{activeContact.fullName || activeContact.email}</div>
                        </div>
                    ) : (
                        <div className="font-semibold">Vui lòng chọn người cần hổ trợ</div>
                    )}
                    {/* <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faSearch} />
                    </div> */}
                </div>

                {/* Chat Messages */}
                <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {chatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.userID === null ? 'justify-start' : 'justify-end'}`}>
                            <div className={`p-2 rounded-md ${message.userID === null ? 'bg-gray-200' : 'bg-blue-500 text-white'} max-w-[75%] w-auto`}>
                                <div className="break-words">{message.content}</div>
                                <div className="text-xs text-gray-700 mt-1">{formatDateForDisplay(message.createdAt)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="flex items-center p-4 bg-white border-t border-gray-300">
                    <input
                        className="flex-1 p-2 border rounded-md mr-2"
                        placeholder="Nhập tin nhắn ..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                    />
                    <button onClick={handleSendMessage} className="p-2 rounded-full bg-blue-500 text-white">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatApp;
