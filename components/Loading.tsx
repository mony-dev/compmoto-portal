import { Flex, Spin } from "antd";
import React from "react";

function Loading(props: any) {
  return (
    <Flex
      style={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin size="large" />
    </Flex>
  );
}

export default Loading;
