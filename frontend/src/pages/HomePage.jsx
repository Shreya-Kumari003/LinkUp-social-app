import {
  Box,
  Flex,
  Spinner,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import { SearchIcon } from "@chakra-ui/icons";
import Lottie from "lottie-react";
import animationData from "../assets/empty-feed.json";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const showToast = useShowToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (res.ok) {
        console.log(searchedUser);

        navigate(`/${searchedUser.username}`);
      } else {
        showToast("Error", "User not found", "error");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <Flex gap="10" alignItems={"flex-start"}>
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <div>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border="1px"
              borderColor="gray.300"
              borderRadius="lg"
              p={6}
              boxShadow="md"
              gap={4} // Chakra's equivalent of Tailwind's space-y
            >
              <Text fontWeight="extrabold" fontSize="xl">
                Your feed is empty!
              </Text>
              <Text color="gray.500" textAlign="center">
                Start following users to see their posts appear in your feed.
              </Text>
              <Lottie animationData={animationData} />
            </Box>
          </div>
        )}

        {loading && (
          <Flex justify="center">
            <Spinner size="xl" />
          </Flex>
        )}

        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>

      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <form onSubmit={handleSearch}>
          <Flex alignItems="center" gap={2} width="100%" mb={2}>
            <InputGroup>
              <Input
                placeholder="Search for a user"
                onChange={(e) => setSearchText(e.target.value)}
                size="md"
                variant="outline"
                focusBorderColor="blue.400"
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={handleSearch}
                  type="submit"
                  _hover={{ background: "transparent" }}
                  _focus={{ boxShadow: "none" }}
                >
                  <SearchIcon />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Flex>
        </form>

        <SuggestedUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
