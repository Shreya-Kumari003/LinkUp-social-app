import {
	Button,
	Flex,
	Image,
	Link,
	Box,
	Input,
	InputGroup,
	InputRightElement,
	IconButton,
	VStack,
	Drawer,
	DrawerOverlay,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	useDisclosure,
	useColorMode,
  } from "@chakra-ui/react";
  import { useRecoilValue, useSetRecoilState } from "recoil";
  import userAtom from "../atoms/userAtom";
  import authScreenAtom from "../atoms/authAtom";
  import { AiFillHome } from "react-icons/ai";
  import { RxAvatar } from "react-icons/rx";
  import { FiLogOut } from "react-icons/fi";
  import { BsFillChatQuoteFill } from "react-icons/bs";
  import { MdOutlineSettings } from "react-icons/md";
  import { HamburgerIcon, SearchIcon } from "@chakra-ui/icons";
  import { Link as RouterLink, useNavigate } from "react-router-dom";
  import useLogout from "../hooks/useLogout";
  import { useState } from "react";
  import useShowToast from "../hooks/useShowToast";
  
  const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [searchText, setSearchText] = useState("");
	const showToast = useShowToast();
	const navigate = useNavigate();
  
	const handleSearch = async (e) => {
	  e.preventDefault();
	  try {
		const res = await fetch(`/api/users/profile/${searchText}`);
		const searchedUser = await res.json();
		if (res.ok) {
		  console.log(searchedUser);
  
		  navigate(`/${searchedUser.username}`);
		  onClose();
		} else {
		  showToast("Error", "User not found", "error");
		}
	  } catch (error) {
		showToast("Error", error.message, "error");
	  }
	};
  
	return (
	  <Flex
		justifyContent="space-between"
		alignItems="center"
		// mt={6}
		mb={8}
		p={4}
		bg={colorMode === "dark" ? "gray.800" : "white"}
		borderRadius="md"
		borderTopRadius={"none"}
		boxShadow="lg"
		width="full"
	  >
		{/* Logo */}
		<Image
		  cursor="pointer"
		  alt="logo"
		  w={8}
		  src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
		  onClick={toggleColorMode}
		/>
  
		{/* Hamburger Icon for Small Screens */}
		<Box display={["block", "none"]}>
		  <IconButton
			aria-label="Open Menu"
			icon={<HamburgerIcon />}
			variant="outline"
			onClick={onOpen}
		  />
		</Box>
  
		{/* Drawer for Menu Items */}
		<Drawer isOpen={isOpen} placement="right" onClose={onClose}>
		  <DrawerOverlay />
		  <DrawerContent>
			<DrawerHeader>Menu</DrawerHeader>
			<DrawerBody>
			  <VStack spacing={4} align="stretch">
				{user ? (
				  <>
					{/* Home */}
					<Link as={RouterLink} to="/" onClick={onClose}>
					  <Button
						variant="ghost"
						leftIcon={<AiFillHome />}
						width="full"
					  >
						Home
					  </Button>
					</Link>
  
					{/* Profile */}
					<Link
					  as={RouterLink}
					  to={`/${user.username}`}
					  onClick={onClose}
					>
					  <Button
						variant="ghost"
						leftIcon={<RxAvatar />}
						width="full"
					  >
						Profile
					  </Button>
					</Link>
  
					{/* Chat */}
					<Link as={RouterLink} to="/chat" onClick={onClose}>
					  <Button
						variant="ghost"
						leftIcon={<BsFillChatQuoteFill />}
						width="full"
					  >
						Chat
					  </Button>
					</Link>
  
					{/* Settings */}
					<Link as={RouterLink} to="/settings" onClick={onClose}>
					  <Button
						variant="ghost"
						leftIcon={<MdOutlineSettings />}
						width="full"
					  >
						Settings
					  </Button>
					</Link>
  
					{/* Logout */}
					<Button
					  onClick={() => {
						logout();
						onClose();
					  }}
					  variant="solid"
					  colorScheme="red"
					  leftIcon={<FiLogOut />}
					  width="full"
					>
					  Logout
					</Button>
				  </>
				) : (
				  <>
					{/* Login */}
					<Link
					  as={RouterLink}
					  to={"/auth"}
					  onClick={() => setAuthScreen("login")}
					>
					  <Button
						variant="solid"
						colorScheme="blue"
						onClick={() => {
						  onClose();
						}}
						width="full"
					  >
						Login
					  </Button>
					</Link>
					{/* Signup */}
					<Link
					  as={RouterLink}
					  to={"/auth"}
					  onClick={() => setAuthScreen("signup")}
					>
					  <Button
						variant="outline"
						colorScheme="green"
						onClick={() => {
						  onClose();
						}}
						width="full"
					  >
						Signup
					  </Button>
					</Link>
				  </>
				)}
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
			  </VStack>
			</DrawerBody>
		  </DrawerContent>
		</Drawer>
  
		{/* Navigation Links for Larger Screens */}
		<Flex display={["none", "flex"]} alignItems="center" gap={4}>
		  {user ? (
			<>
			  {/* Home */}
			  <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
				<Button
				  variant="ghost"
				  color={colorMode === "dark" ? "white" : "black"}
				  leftIcon={<AiFillHome />}
				>
				  Home
				</Button>
			  </Link>
  
			  {/* Profile */}
			  <Link
				as={RouterLink}
				to={`/${user.username}`}
				_hover={{ textDecoration: "none" }}
			  >
				<Button
				  variant="ghost"
				  color={colorMode === "dark" ? "white" : "black"}
				  leftIcon={<RxAvatar />}
				>
				  Profile
				</Button>
			  </Link>
  
			  {/* Chat */}
			  <Link
				as={RouterLink}
				to="/chat"
				_hover={{ textDecoration: "none" }}
			  >
				<Button
				  variant="ghost"
				  color={colorMode === "dark" ? "white" : "black"}
				  leftIcon={<BsFillChatQuoteFill />}
				>
				  Chat
				</Button>
			  </Link>
  
			  {/* Settings */}
			  <Link
				as={RouterLink}
				to="/settings"
				_hover={{ textDecoration: "none" }}
			  >
				<Button
				  variant="ghost"
				  color={colorMode === "dark" ? "white" : "black"}
				  leftIcon={<MdOutlineSettings />}
				>
				  Settings
				</Button>
			  </Link>
  
			  {/* Logout */}
			  <Button
				onClick={logout}
				colorScheme="red"
				variant="solid"
				leftIcon={<FiLogOut />}
			  >
				Logout
			  </Button>
			</>
		  ) : (
			<>
			  {/* Login */}
			  <Link
				as={RouterLink}
				to={"/auth"}
				onClick={() => setAuthScreen("login")}
			  >
				<Button variant="solid" colorScheme="blue">
				  Login
				</Button>
			  </Link>
  
			  {/* Signup */}
			  <Link
				as={RouterLink}
				to={"/auth"}
				onClick={() => setAuthScreen("signup")}
			  >
				<Button variant="outline" colorScheme="green">
				  Signup
				</Button>
			  </Link>
			</>
		  )}
		</Flex>
	  </Flex>
	);
  };
  
  export default Header;
  