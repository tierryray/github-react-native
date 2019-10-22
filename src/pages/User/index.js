/* eslint-disable no-unused-expressions */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 1,
    refreshing: false,
    visible: false,
    visibleList: false,
  };

  async componentDidMount() {
    this.load();
  }

  load = async (page = 1) => {
    const { stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page,
      refreshing: false,
      visible: true,
      visibleList: true,
    });
  };

  loadMore = async () => {
    const { page } = this.state;

    const nextPage = page + 1;

    this.load(nextPage);
  };

  refreshList = async () => {
    this.setState({
      refreshing: true,
      visibleList: false,
      stars: [],
    });

    this.load();
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, refreshing, visible, visibleList } = this.state;
    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <ShimmerPlaceHolder
            autoRun
            visible={visible}
            height={100}
            width={100}
            reverse
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 50,
              marginBottom: 10,
            }}
          >
            <Avatar source={{ uri: user.avatar }} />
          </ShimmerPlaceHolder>
          <ShimmerPlaceHolder
            autoRun
            visible={visible}
            style={{
              backgroundColor: '#f5f5f5',
            }}
          >
            <Name>{user.name}</Name>
          </ShimmerPlaceHolder>
          <ShimmerPlaceHolder
            autoRun
            visible={visible}
            style={{
              backgroundColor: '#f5f5f5',
            }}
          >
            <Bio>{user.bio}</Bio>
          </ShimmerPlaceHolder>
        </Header>

        <ShimmerPlaceHolder
          autoRun
          visible={visibleList}
          height={60}
          style={{
            backgroundColor: '#f5f5f5',
            marginTop: 10,
            width: '100%',
          }}
        >
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            renderItem={({ item }) => {
              if (item.owner && item.owner.avatar_url) {
                return (
                  <Starred onPress={() => this.handleNavigate(item)}>
                    <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                    <Info>
                      <Title>{item.name}</Title>
                      <Author>{item.owner.login}</Author>
                    </Info>
                  </Starred>
                );
              }
            }}
          />
        </ShimmerPlaceHolder>
      </Container>
    );
  }
}
