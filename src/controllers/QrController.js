import qr from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import { __dirname } from '../../path.js';
import Qr from '../models/qrModel.js';
import cryptoRandomString from 'crypto-random-string';

const generateQRCode = async (req, res) => {
  try {
    const { url, title, color } = req.body;
    const logo = req.file;

    if (!url || !title) {
      return res.status(400).json({ error: 'Please provide both URL and title' });
    }

    // Generate QR code
    const qrCodeBuffer = await qr.toBuffer(url, {
      color: {
        dark: color || '#000000',
        light: '#ffffff'
      }
    });

    let finalImage = sharp(qrCodeBuffer).resize(300, 300);

    let logoDataURI = null;

    // If logo is provided, overlay it on the QR code
    if (logo) {
      const logoBuffer = await sharp(logo.buffer)
        .resize(50, 50)
        .toBuffer();
      
      finalImage = finalImage.composite([
        { input: logoBuffer, gravity: 'center' }
      ]);

      // Convert logoBuffer to Base64 Data URI
      const base64Logo = logoBuffer.toString('base64');
      logoDataURI = `data:image/png;base64,${base64Logo}`; // Create Data URI for logo
    }

    const outputBuffer = await finalImage.png().toBuffer();

    // Convert buffer to base64
    const base64Image = outputBuffer.toString('base64');
    const dataURI = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      imageData: dataURI,
      title: title,
      url: url,
      logo: logoDataURI // Include logo Data URI in the response
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

const qrmain = async(req,res) =>{
    res.sendFile(path.join(__dirname, 'src', 'views', 'qrcode.html'));
}

const saveQR = async (req, res) => {
  try {
    const id_qr = await uniqueRandomIDqr(); 
    const email = req.session.email; 
    const { date} = req.body;
    const { body } = req;
    
    // Save binary imageBuffer
    await Qr.insert(id_qr, date, email, body);
    res.status(200).json({ message: 'QR code saved successfully' });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Failed to save QR code' });
  }
};


const pickQR = async (req, res) => {
  try {
    const email = req.session.email;
    const idsResult = await Qr.getid(email);

    if (idsResult.rows.length === 0) {
      console.log('No QR codes found for this email');
      return res.status(404).json({ 
        success: false, 
        error: 'No QR codes found for this email' 
      });
    }

    const qrData = [];
    for (const row of idsResult.rows) {
      const id = row.id_qr;
      const styleResult = await Qr.show(id);

      if (styleResult.rows.length > 0) {
        qrData.push({ 
          id: id, 
          style: styleResult.rows[0].style 
        });
      }
    }

    if (qrData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No styles found for the provided QR codes'
      });
    }

    res.status(200).json({
      success: true,
      qrData: qrData
    });

  } catch (error) {
    console.error('Error retrieving QR codes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve QR codes' 
    });
  }
};





async function uniqueRandomIDqr() {
  let id;
  while (true) {
    id = cryptoRandomString({ length: 4, type: "alphanumeric" });
    if (await isIDuniqueqr(id)) {
      break;
    }
  }
  return id;
}

async function isIDuniqueqr(id) {
  const result = await Qr.exists("id_qr", id);
  // const result = await pool.query(`SELECT EXISTS(SELECT 1 FROM shortlinks WHERE id_shortlink = $1)`, [id]);
  return !result.rows[0]["exists"];
}

const deleteQR = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id exists
    if (!id) {
      console.log('ID parameter is missing');
      return res.status(400).json({
        success: false,
        error: 'ID parameter is required'
      });
    }

    // Log untuk debugging

    // Hapus QR code
    const result = await Qr.delete(id);
    
    // Log hasil query


    // Cek apakah data berhasil dihapus
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR code deleted successfully'
    });

  } catch (error) {
    // Log error lengkap untuk debugging
    console.error('Detailed error deleting QR code:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete QR code',
      details: error.message // tambahkan detail error untuk debugging
    });
  }
};

export default{
    generateQRCode,
    qrmain,
    saveQR,
    pickQR,
    deleteQR
};
