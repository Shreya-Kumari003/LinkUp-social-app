import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import usePreviewImg from "../hooks/usePreviewImg";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const imageRef = useRef(null);
  const emojiRef = useRef(); // Reference for emoji picker
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      console.log(data);
      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji.emoji); // Append the selected emoji to the message
    setEmojiPickerOpen(false); // Close the emoji picker after selection
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiRef.current && !emojiRef.current.contains(event.target)
      ) {
        setEmojiPickerOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <Flex gap={2} alignItems={"center"} justifyContent="space-between">
      {/* Emoji Picker Button */}
      <Flex
        flex={0.1} // Adjust width as per need
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
        onClick={() => setEmojiPickerOpen((prev) => !prev)} // Toggle emoji picker visibility
      >
        <span role="img" aria-label="emoji" style={{ fontSize: "20px" }}>
          😊
        </span>
      </Flex>

      {/* Emoji Picker - display when emojiPickerOpen is true */}
      {emojiPickerOpen && (
        <div ref={emojiRef} style={{ position: "absolute", bottom: "60px", left: "10px", zIndex: 10 }}>
          <EmojiPicker
            theme="dark"
            onEmojiClick={handleAddEmoji}
            autoFocusSearch={false}
          />
        </div>
      )}

      {/* Input and Send Button */}
      <form onSubmit={handleSendMessage} style={{ flex: 3 }}>
        <InputGroup>
          <Input
            w={"full"}
            placeholder="Type a message"
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
          />
          <InputRightElement
            onClick={handleSendMessage}
            cursor={"pointer"}
            style={{ right: "0" }}
          >
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>

      {/* Image Picker */}
      <Flex
        flex={0.1}
        justifyContent="center"
        alignItems="center"
        cursor={"pointer"}
        onClick={() => imageRef.current.click()}
      >
        <BsFillImageFill size={20} />
        <Input
          type={"file"}
          hidden
          ref={imageRef}
          onChange={handleImageChange}
        />
      </Flex>

      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={"full"}>
              <Image src={imgUrl} />
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? (
                <IoSendSharp
                  size={24}
                  cursor={"pointer"}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;

