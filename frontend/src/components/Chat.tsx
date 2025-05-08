import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, TextField, CircularProgress, List, ListItem, Fade, IconButton, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { styled } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchMessages, sendMessage, type Message } from '../slices/chatSlice';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  token: string;
}

const MessageBubble = styled(Paper)(({ theme, isUser }: { theme?: any; isUser: boolean }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: '70%',
  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  position: 'relative',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  '&:hover': {
    transform: 'translateY(-1px)',
    transition: 'transform 0.2s ease-in-out',
  },
  '& code': {
    backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: 4,
    fontSize: '0.9em',
  },
  '& pre': {
    backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : theme.palette.grey[100],
    padding: theme.spacing(1),
    borderRadius: 4,
    overflow: 'auto',
  },
  '& a': {
    color: isUser ? theme.palette.primary.contrastText : theme.palette.primary.main,
    textDecoration: 'underline',
  },
}));

const Chat: React.FC<ChatProps> = ({ token }) => {
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector(state => state.chat);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (token) dispatch(fetchMessages(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(sendMessage({ text: input, token }));
      setInput('');
    }
  };

  const theme = useTheme();

  return (
    <Box
      display='flex'
      flexDirection='column'
      height='100vh'
      maxWidth={800}
      mx='auto'
      p={2}>
      <Paper
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
        }}>
        <List
          ref={listRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            '& > *': {
              mb: 1,
            },
          }}>
          {messages.map((msg: Message) => (
            <Fade
              key={msg._id}
              in={true}
              timeout={500}>
              <ListItem
                style={{
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
                sx={{
                  display: 'flex',
                  justification: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  p: 1,
                }}>
                <MessageBubble isUser={msg.sender === 'user'}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </MessageBubble>
              </ListItem>
            </Fade>
          ))}
          {loading && (
            <Box
              display='flex'
              justifyContent='center'
              p={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </List>
        <Box
          component='form'
          onSubmit={handleSend}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: theme.palette.background.paper,
          }}>
          <Box
            display='flex'
            gap={1}>
            <TextField
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Type your message...'
              fullWidth
              disabled={loading}
              variant='outlined'
              size='small'
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              type='submit'
              disabled={loading || !input.trim()}
              color='primary'
              sx={{
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
