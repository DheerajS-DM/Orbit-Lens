import { useState } from 'react';
import { TextField, Button, Typography, Box, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Send as SendIcon, Description as ReportIcon } from '@mui/icons-material';
import axios from 'axios';

export default function ReportForm({ isNavbar = false }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', msg: 'Generating CSV and sending...' });

    try {
      const response = await axios.post('http://localhost:5000/api/send-report', { email });
      setStatus({ type: 'success', msg: response.data.message });
      setEmail("");
      if (isNavbar) setTimeout(() => setOpen(false), 2000); // Auto-close dialog on success
    } catch (error) {
      setStatus({ type: 'error', msg: 'Mailing failed. Check server logs.' });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSend}>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField 
          placeholder="Enter Email" 
          variant="outlined" 
          size="small" 
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="success" disabled={loading} sx={{ minWidth: 'auto' }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </Button>
      </Box>
      {status.msg && <Alert severity={status.type} sx={{ mt: 2, py: 0 }}>{status.msg}</Alert>}
    </form>
  );

  // If used in the Navbar, render a Button that opens a Dialog
  if (isNavbar) {
    return (
      <>
        <Button 
          variant="outlined" 
          color="success" 
          startIcon={<ReportIcon />}
          onClick={() => setOpen(true)}
          sx={{ ml: 2 }}
        >
          Get CSV
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { bgcolor: '#0a192f', color: 'white', p: 1 } }}>
          <DialogTitle>📩 Request Intelligence Report</DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={2} color="gray">
              We will generate a CSV of the latest NASA events and email it directly to you.
            </Typography>
            {formContent}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Standard flat render for placing directly on a page
  return (
    <Box sx={{ p: 2, bgcolor: 'rgba(17, 34, 64, 0.9)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: 2 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">📩 Intelligence Report (CSV)</Typography>
      {formContent}
    </Box>
  );
}