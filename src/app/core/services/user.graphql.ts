import gql from 'graphql-tag';
import { fileFragment } from './file.graphql';
import { User } from '../models/user.model';

export interface AllUsersQuery {
  allUsers: User[];
}

export interface UserQuery {
  User: User;
}

const UserFragment = gql `
  fragment UserFragment on User {
    id
    name
    email
    createdAt
    photo {
      ...fileFragment
    }
  }
  ${fileFragment}
`;

export const ALL_USERS_QUERY = gql `
  query AllUsersQuery($idToExclude: ID!){
    allUsers(
      orderBy: name_ASC,
      filter: {
        id_not: $idToExclude
      }
    ) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;


export const GET_USER_BY_ID_QUERY = gql `
  query GetUserByIdQuery($userId: ID!) {
    User(id: $userId)
    {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($userId: ID!, $name: String!, $email: String!) {
    updateUser(
      id: $userId
      name: $name
      email: $email
    ){
      ...UserFragment
    }
  }
  ${UserFragment}
`;

const updateUserPhotoMutation = `
  updateUser(id: $loggedUserId, photoId: $newPhotoId) {
    ...UserFragment
  }
`;

const deleteFileMutation = `
  deleteFile(id: $oldPhotoId) {
    id
    secret
  }
`;

export const getUpdateUserPhotoMutation = (hasOldPhoto: boolean) => {
  if (hasOldPhoto) {
    return gql `
      mutation updateAndDeleUserPhoto($loggedUserId: ID!, $newPhotoId: ID!, $oldPhotoId: ID!) {
        ${updateUserPhotoMutation}
        ${deleteFileMutation}
      }
      ${UserFragment}
    `;
  }
  return gql `
    mutation updateUserPhoto($loggedUserId: ID!, $newPhotoId: ID) {
      ${updateUserPhotoMutation}
    }
    ${UserFragment}
  `;
};

export const USERS_SUBSCRIPTON = gql`
  subscription UserSubscription {
    User(
      filter: {
        mutation_in: [CREATED, UPDATED]
      }
    ) {
      mutation
      node{
        ...UserFragment
      }
    }
  }
  ${UserFragment}
`;
