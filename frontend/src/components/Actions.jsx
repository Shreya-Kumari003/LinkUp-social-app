import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  Divider,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTelegram,
  FaLink,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";

const Actions = ({ post, postId, postedBy }) => {
  const user = useRecoilValue(userAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState("");

  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isShareOpen,
    onOpen: onShareOpenModal,
    onClose: onShareCloseModal,
  } = useDisclosure();

  const onShareOpen = () => {
    onShareOpenModal(); // Open the modal
  };
  const handleCopyLink = () => {
    const link = `https://linkup-social-app.onrender.com/${postedBy}/post/${postId}`;
    navigator.clipboard.writeText(link); // Copy the link to clipboard
    showToast("Success", "Link copied to clipboard", "success"); // Show a success message
  };

  const handleLikeAndUnlike = async () => {
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error"
      );
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch("/api/posts/like/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      if (!liked) {
        // add the id of the current user to post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: [...p.likes, user._id] };
          }
          return p;
        });
        setPosts(updatedPosts);
      } else {
        // remove the id of the current user from post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: p.likes.filter((id) => id !== user._id) };
          }
          return p;
        });
        setPosts(updatedPosts);
      }

      setLiked(!liked);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async () => {
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to reply to a post",
        "error"
      );
    if (isReplying) return;
    setIsReplying(true);
    try {
      const res = await fetch("/api/posts/reply/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, data] };
        }
        return p;
      });
      setPosts(updatedPosts);
      showToast("Success", "Reply posted successfully", "success");
      onClose();
      setReply("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <Flex flexDirection="column" width={"full"} >
      <Flex gap={3} my={2} justifyContent={"space-between"} paddingRight={4} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label="Like"
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={handleLikeAndUnlike}
        >
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>

        <svg
          aria-label="Comment"
          color=""
          fill=""
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={onOpen}
        >
          <title>Comment</title>
          <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>

        {/* <RepostSVG /> */}
        {/* share svg */}
        <svg
          aria-label="Share"
          color=""
          fill="rgb(243, 245, 247)"
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={() => onShareOpen(post)}
        >
          <title>Share</title>
          <line
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="22"
            x2="9.218"
            y1="3"
            y2="10.083"
          ></line>
          <polygon
            fill="none"
            points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></polygon>
        </svg>
      </Flex>

      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.light"} fontSize="sm">
          {post.replies.length} replies
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.likes.length} likes
        </Text>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Reply goes here.."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              size={"sm"}
              mr={3}
              isLoading={isReplying}
              onClick={handleReply}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isShareOpen} onClose={onShareCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share This Post</ModalHeader>
          <Divider />
          <ModalCloseButton />
          <ModalBody>
            <Text mt={3}>Share this link via:</Text>
            <HStack spacing={4} mt={4} justify="space-between" width="100%">
              <a href="https://www.facebook.com/">
              <IconButton
                aria-label="Share on Facebook"
                icon={<FaFacebook size="30px" />}
                colorScheme="facebook"
                borderRadius="full"
                flex="1"
                boxSize="65px"
              />
              </a>
              <a href="https://x.com/">
              <IconButton
                aria-label="Share on Twitter"
                icon={<FaXTwitter size="30px" />}
                colorScheme="twitter"
                borderRadius="full"
                flex="1"
                boxSize="65px"
              />
              </a>
              <a href="https://www.instagram.com/">
              <IconButton
                aria-label="Share on Instagram"
                icon={<FaInstagram size="30px" />}
                bgGradient="linear(to-r, pink.500, purple.500)"
                _hover={{
                  bgGradient: "linear(to-r, pink.600, purple.600)",
                }}
                color="white"
                borderRadius="full"
                flex="1"
                boxSize="65px"
              />
              </a>
                <a href="https://web.whatsapp.com/">
              <IconButton
                aria-label="Share on WhatsApp"
                icon={<FaWhatsapp size="30px" />}
                colorScheme="whatsapp"
                borderRadius="full"
                flex="1"
                boxSize="65px"
              />
                </a>
                <a href="https://web.telegram.org/">
              <IconButton
                aria-label="Share on Telegram"
                icon={<FaTelegram size="30px" />}
                colorScheme="telegram"
                borderRadius="full"
                flex="1"
                boxSize="65px"
              />
                </a>
            </HStack>
            <Text mt={6}>Or copy link:</Text>
            <InputGroup mt={3}>
              <InputLeftElement>
                <FaLink color="gray.500" />
              </InputLeftElement>
              <Input
                isReadOnly
                value={`https://linkup-social-app.onrender.com/${postedBy}/post/${postId}`}
                variant="outline"
                focusBorderColor="blue.400"
                pr="4.5rem" // Ensures space for the button
                pl="2.5rem" // Adds space to the left for the icon
              />
              <InputRightElement width="4.5rem">
                <Button
                  size="sm"
                  colorScheme="blue"
                  borderRadius="md"
                  ml="2"
                  onClick={handleCopyLink}
                >
                  Copy
                </Button>
              </InputRightElement>
            </InputGroup>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Actions;

const RepostSVG = () => {
  return (
    <svg
      aria-label="Repost"
      color="currentColor"
      fill="currentColor"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
    >
      <title>Repost</title>
      <path
        fill=""
        d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
      ></path>
    </svg>
  );
};
