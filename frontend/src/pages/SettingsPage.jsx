import { Button, Text, Spinner,Divider } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const SettingsPage = () => {
  const showToast = useShowToast();
  const logout = useLogout();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?"))
      return;

    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      if (data.success) {
        await logout();
        showToast("Success", "Your account has been frozen!", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const clearChatHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear your chat history? This action cannot be undone."
      )
    )
      return;

    setLoadingChat(true); // Start loading for chat history

    try {
      const res = await fetch("/api/users/clearchat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      if (data.message) {
        showToast("Success", data.message, "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoadingChat(false); // End loading for chat history
    }
  };

  const clearAllPosts = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all your posts? This action cannot be undone."
      )
    )
      return;

    setLoadingPosts(true); // Start loading for posts

    try {
      const res = await fetch("/api/users/clearpost", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      if (data.message) {
        showToast("Success", data.message, "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoadingPosts(false); // End loading for posts
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action is irreversible!"
      )
    )
      return;

    setIsDeleting(true); // Show spinner when delete operation starts

    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        setIsDeleting(false); // Hide spinner if there's an error
        return showToast("Error", data.error, "error");
      }
      if (data.success) {
        await logout();
        showToast("Success", "Your account has been deleted!", "success");
        navigate("/auth"); // Navigate to the /auth page
      }
    } catch (error) {
      setIsDeleting(false); // Hide spinner if there's an exception
      showToast("Error", error.message, "error");
    }
  };

  return (
    <>
      <Text my={1} fontWeight={"bold"}>
        Freeze Your Account
      </Text>
      <Text my={1}>You can unfreeze your account anytime by logging in.</Text>
      <Button size={"sm"} colorScheme="blue" onClick={freezeAccount}>
        Freeze
      </Button>
	  <Divider my={4}/>
      <Text my={4} fontWeight={"bold"}>
        Clear Chat History
      </Text>
      <Text my={1}>This will delete all your messages and conversations.</Text>
      <Button
        size={"sm"}
        colorScheme="red"
        onClick={clearChatHistory}
        isLoading={loadingChat}
        loadingText="Deleting"
      >
        Clear Chat History
      </Button>
	  <Divider my={4}/>

      <Text my={4} fontWeight={"bold"}>
        Delete All Posts
      </Text>
      <Text my={1}>
        This will permanently delete all your posts and their images.
      </Text>
      <Button
        size={"sm"}
        colorScheme="red"
        onClick={clearAllPosts}
        isLoading={loadingPosts}
        loadingText="Deleting"
      >
        Delete All Posts
      </Button>
	  <Divider my={4}/>
      <Text my={4} fontWeight={"bold"}>
        Delete Your Account
      </Text>
      <Text my={1}>
        This action is irreversible. All your data will be deleted permanently.
      </Text>
      <Button
        size={"sm"}
        colorScheme="red"
        onClick={deleteAccount}
        isLoading={isDeleting}
        loadingText="Deleting..."
      >
        {isDeleting ? <Spinner size="sm" /> : "Delete Account"}
      </Button>
    </>
  );
};
