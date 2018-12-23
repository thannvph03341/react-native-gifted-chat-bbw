/* eslint no-use-before-define: ["error", { "variables": false }] */

import PropTypes from "prop-types";
import React from "react";
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
  Dimensions
} from "react-native";

import MessageText from "./MessageText";
import MessageImage from "./MessageImage";
import Time from "./Time";
import Color from "./Color";

import { isSameUser, isSameDay } from "./utils";

export default class Bubble extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else if (this.props.currentMessage.text) {
      const options = ["Copy Text", "Cancel"];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.text);
              break;
            default:
              break;
          }
        }
      );
    }
  }

  handleBubbleToNext() {
    if (
      isSameUser(this.props.currentMessage, this.props.nextMessage) &&
      isSameDay(this.props.currentMessage, this.props.nextMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToNext,
        this.props.containerToNextStyle[this.props.position]
      ]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToPrevious,
        this.props.containerToPreviousStyle[this.props.position]
      ]);
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage } = this.props;
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return null;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && (
            <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>
          )}
          {currentMessage.received && (
            <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>
          )}
        </View>
      );
    }
    return null;
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  render() {
    return (
      <View
        style={[
          styles[this.props.position].container,
          this.props.containerStyle[this.props.position],
        ]}
      >
        <View style={[styles[this.props.position].containerTriangle]}>
          {this.props.position === "left" &&
            !this.props.currentMessage.image &&
            !this.props.currentMessage.video ? (
              <View style={[styles[this.props.position].triangle]} />
            ) : null}

          {this.props.position === "right" &&
            this.props.currentMessage.audio ? (
              <Text
                style={{
                  color: Color.timeTextColor,
                  fontSize: 12,
                  fontWeight: "bold"
                }}
              >
                {parseFloat(this.props.currentMessage.audio.time).toFixed(1)}"
            </Text>
            ) : null}

          {this.props.position === "right" &&
            this.props.currentMessage.isNotSent && this.props.renderExtraView()}
          <View
            style={[
              styles[this.props.position].wrapper, this.props.currentMessage.file ? { backgroundColor: "white", } : {},
              !this.props.currentMessage.audio
                ? this.props.wrapperStyle[this.props.position]
                : styles[this.props.position].audio,
              this.handleBubbleToNext(),
              this.handleBubbleToPrevious(),
              { marginLeft: 0 },

            ]}
          >
            <TouchableWithoutFeedback
              onLongPress={this.onLongPress}
              accessibilityTraits="text"
              {...this.props.touchableProps}
            >
              <View>
                {this.renderCustomView()}
                {/* {this.renderMessageImage()} */}
                {this.renderMessageText()}
              </View>
            </TouchableWithoutFeedback>
          </View>
          {this.props.position === "right" &&
            !this.props.currentMessage.images &&
            !this.props.currentMessage.image &&
            !this.props.currentMessage.video ? (
              <View
                style={[
                  styles[this.props.position].triangle,
                  {
                    borderLeftColor: this.props.currentMessage.contact || this.props.currentMessage.file
                      ? "white"
                      : "#1AAC19"
                  }
                ]}
              />
            ) : null}

          {this.props.position === "left" && this.props.currentMessage.audio ? (
            <Text
              style={{
                color: Color.timeTextColor,
                fontSize: 12,
                fontWeight: "bold"
              }}
            >
              {parseFloat(this.props.currentMessage.audio.time).toFixed(1)}"
            </Text>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,

      alignItems: "flex-start"
    },
    wrapper: {
      // borderRadius: 15,
      // backgroundColor: Color.leftBubbleBackground,
      borderRadius: 4,
      // borderWidth: 0.5,
      borderColor: "#dbdbdb",
      backgroundColor: "#fff",

      marginRight: 60,
      // minHeight: 20,
      // justifyContent: 'flex-end',
      minHeight: 40,
      justifyContent: "center"
    },
    audio: {
      backgroundColor: "#F4F7F8",
      marginLeft: 0,
      marginRight: 5,
      width: Dimensions.get("window").width / 3,
      alignItems: "flex-start"
    },
    containerToNext: {
      borderBottomLeftRadius: 3
    },
    containerToPrevious: {
      borderTopLeftRadius: 3
    },
    containerTriangle: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 15
    },
    triangle: {
      marginTop: 15,
      borderTopWidth: 8 / 2.0,
      borderRightWidth: 6,
      borderBottomWidth: 8 / 2.0,
      borderLeftWidth: 0,
      borderTopColor: "transparent",
      borderRightColor: "#F4F7F8",
      borderBottomColor: "transparent",
      borderLeftColor: "transparent"
    }
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      // flexDirection:'row',
      alignItems: "flex-end"
    },
    wrapper: {
      // borderRadius: 15,
      // backgroundColor: Color.defaultBlue,
      borderRadius: 4,
      // borderWidth: 0.5,
      borderColor: "#dbdbdb",
      backgroundColor: "#1AAC19",

      marginLeft: 60,
      // minHeight: 20,
      // justifyContent: 'flex-end',
      minHeight: 40,
      justifyContent: "center"
    },
    audio: {
      backgroundColor: "#1AAC19",
      marginRight: 0,
      marginLeft: 5,
      width: Dimensions.get("window").width / 4,
      alignItems: "flex-end"
    },
    containerTriangle: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 15
    },
    triangle: {
      marginTop: 15,
      borderTopWidth: 8 / 2.0,
      borderRightWidth: 0,
      borderBottomWidth: 8 / 2.0,
      borderLeftWidth: 6,
      borderTopColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderLeftColor: "#1AAC19"
    },
    containerToNext: {
      borderBottomRightRadius: 3
    },
    containerToPrevious: {
      borderTopRightRadius: 3
    }
  }),
  bottom: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  tick: {
    fontSize: 10,
    backgroundColor: Color.backgroundTransparent,
    color: Color.white
  },
  tickView: {
    flexDirection: "row",
    marginRight: 10
  }
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTicks: null,
  renderTime: null,
  position: "left",
  currentMessage: {
    text: null,
    createdAt: null,
    image: null
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {}
};

Bubble.propTypes = {
  user: PropTypes.object.isRequired,
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  position: PropTypes.oneOf(["left", "right"]),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style
  })
};
