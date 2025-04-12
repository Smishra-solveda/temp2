import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function generateCongratulationsPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText('Congratulations!!!', {
    x: 50,
    y: height - 100,
    size: 30,
    font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('You have been selected!', {
    x: 50,
    y: height - 150,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });
  
  return await pdfDoc.save();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBytes = await generateCongratulationsPDF();

    // Send email with PDF attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Congratulations on Your Selection!',
      text: 'Congratulations!!! You have been selected. Please find the attached PDF for more details.',
      attachments: [
        {
          filename: 'congratulations.pdf',
          content: Buffer.from(pdfBytes),
        },
      ],
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 