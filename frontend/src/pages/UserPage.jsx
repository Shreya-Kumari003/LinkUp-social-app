import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import postsAtom from "../atoms/postsAtom";
import Comment from "../components/Comment";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const currentUser = useRecoilValue(userAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [replies, setReplies] = useState([]);
  const [fetchingReplies, setFetchingReplies] = useState(false);

  const getReplies = async () => {
    if (!user) return;
    setActiveTab("replies");
    setFetchingReplies(true);
    try {
      const res = await fetch(`/api/users/getreplies`);
      const data = await res.json();
      setReplies(Array.isArray(data.replies) ? data.replies : []);
    } catch (error) {
      showToast("Error", error.message, "error");
      setReplies([]);
    } finally {
      setFetchingReplies(false);
    }
  };

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, showToast, setPosts, user]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!user && !loading) return <h1>User not found</h1>;

  return (
    <>
      <UserHeader user={user} />
      <Flex w={"full"} mt={5}>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "posts" ? "1.5px solid white" : "1px solid gray"
          }
          justifyContent={"center"}
          pb={3}
          cursor={"pointer"}
          onClick={() => setActiveTab("posts")} // Set active tab to "posts"
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "posts" ? "blue.500" : "gray.light"}
          >
            Posts
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "replies" ? "1.5px solid white" : "1px solid gray"
          }
          justifyContent={"center"}
          pb={3}
          cursor={"pointer"}
          onClick={() => {
            if (currentUser._id !== user._id) {
              showToast(
                "Access Denied",
                "You can only view your own replies.",
                "error"
              );
              return;
            }
            getReplies(); // Fetch replies if the condition is met
          }}
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "replies" ? "red.400" : "gray.light"}
          >
            Replies
          </Text>
        </Flex>
      </Flex>

      {/* Content rendered below the tab selectors */}
      <Flex flexDirection="column" mt={5}>
        {activeTab === "posts" && (
          <>
            {!fetchingPosts && posts.length === 0 && (
              <h1>User has no posts.</h1>
            )}
            {fetchingPosts && (
              <Flex justifyContent={"center"} my={12}>
                <Spinner size={"xl"} />
              </Flex>
            )}
            {posts.map((post) => (
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))}
          </>
        )}
        {activeTab === "replies" && (
          <>
            {fetchingReplies && (
              <Flex justifyContent={"center"} my={12}>
                <Spinner size={"xl"} />
              </Flex>
            )}
            {!fetchingReplies && replies.length === 0 && (
              <h1>User has no replies.</h1>
            )}
            {replies.map((reply) => (
              <Comment
                key={reply.replyId}
                reply={{
                  userProfilePic: reply.replyUserProfilePic,
                  username: reply.replyUsername,
                  text: reply.replyText,
                }}
                lastReply={
                  reply.replyId === replies[replies.length - 1].replyId
                }
              />
            ))}
          </>
        )}
      </Flex>
    </>
  );
};

export default UserPage;
