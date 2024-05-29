import styled from "styled-components";

import { type ResponsiveBoxProps } from "./types";
import { aspectRatio } from "./theme";
import { Box } from "@containers";

export const ResponsiveBoxWrapper = styled(Box)<ResponsiveBoxProps>`
  position: relative;

  &::before {
    content: "";
    display: block;
    ${aspectRatio}
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`;
