import StyledComponentsRegistry from "@lib-utils/styled-components-registry";

const RootAdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <StyledComponentsRegistry>{children}</StyledComponentsRegistry>;
};

export default RootAdminLayout;
