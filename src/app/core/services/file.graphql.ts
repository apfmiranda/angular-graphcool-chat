import gql from 'graphql-tag';

export const fileFragment = gql `
  fragment fileFragment on File {
    id
    secret
  }
`;
