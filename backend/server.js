// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfmake');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001; // Você pode escolher outra porta

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' })); // Aumenta o limite para lidar com dados maiores

// Defina as fontes para o PDFMake
const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};

// Garanta que a pasta 'fonts' exista e contenha os arquivos de fonte Roboto
if (!fs.existsSync('fonts')) {
  fs.mkdirSync('fonts');
  console.error("A pasta 'fonts' não foi encontrada. Por favor, crie uma pasta 'fonts' na raiz do backend e adicione os arquivos de fonte Roboto.");
  process.exit(1);
}

app.post('/api/generate', async (req, res) => {
  try {
    const formData = req.body;
    const content = [];

    // Informações Pessoais
    if (formData.name) {
      content.push({ text: formData.name, style: 'header' });
    }
    if (formData.title) {
      content.push({ text: formData.title, style: 'subheader' });
    }

    const contactInfo = [];
    if (formData.email) {
      contactInfo.push({
        text: formData.email,
        style: 'contactInfo',
        link: `mailto:${formData.email}`
      });
    }
    if (formData.phone) {
      const phoneNumber = formData.phone.replace(/[\s-()]/g, ''); // Remove espaços, hífens e parênteses
      if (formData.phoneIsWhatsapp) {
        contactInfo.push({
          text: formData.phone,
          style: 'contactInfo',
          link: `https://wa.me/${phoneNumber}`
        });
      } else {
        contactInfo.push({
          text: formData.phone,
          style: 'contactInfo'
        });
      }
    }
    if (formData.hasLinkedin && formData.linkedinUsername) {
      const linkedinUrl = `https://linkedin.com/in/${formData.linkedinUsername}`;
      contactInfo.push({
        text: `linkedin.com/in/${formData.linkedinUsername}`,
        style: 'contactInfo',
        link: linkedinUrl
      });
    }
    if (formData.hasGithub && formData.githubUsername) {
      const githubUrl = `https://github.com/${formData.githubUsername}`;
      contactInfo.push({
        text: `github.com/${formData.githubUsername}`,
        style: 'contactInfo',
        link: githubUrl
      });
    }
    if (contactInfo.length > 0) {
      content.push({ stack: contactInfo, margin: [0, 0, 0, 0] });
    }

    // Sobre mim
    if (formData.sections['Sobre mim']) {
      content.push({ text: 'Sobre mim', style: 'sectionHeader' });
      content.push({ text: formData.sections['Sobre mim'] });
    }

    // Habilidades Técnicas
    const skillsContent = [];
    if (formData.skills) {
      Object.entries(formData.skills).forEach(([category, subcategories]) => {
        const categorySkills = [];
        Object.entries(subcategories).forEach(([subcategory, skills]) => {
          if (skills && skills.length > 0) {
            categorySkills.push({ text: `${subcategory}: ${skills.join(', ')}`, style: 'skillSubcategoryText' });
          }
        });
        if (categorySkills.length > 0) {
          skillsContent.push({ text: category, style: 'skillCategory' });
          skillsContent.push({ stack: categorySkills, margin: [10, 0, 0, 5] });
        }
      });
    }
    if (skillsContent.length > 0) {
      content.push({ text: 'Habilidades Técnicas', style: 'sectionHeader' });
      content.push(...skillsContent);
    }

    // Experiência Profissional
    if (formData.experience && formData.experience.length > 0) {
      const experienceContent = formData.experience
        .filter(exp => exp.company || exp.title || (exp.startDate && exp.startDate.month && exp.startDate.year) || (exp.endDate && (exp.endDate === 'Atual' || (exp.endDate.month && exp.endDate.year))) || exp.description)
        .map(exp => {
          const parts = [];
          if (exp.company) parts.push({ text: exp.company, style: 'experienceCompany' });
          if (exp.title) parts.push({ text: exp.title, style: 'experienceTitle' });
          const startDateValid = exp.startDate && exp.startDate.month && exp.startDate.year;
          const endDateValid = exp.endDate && (exp.endDate === 'Atual' || (exp.endDate.month && exp.endDate.year));
          if (startDateValid || endDateValid) {
            const startDate = startDateValid ? `${exp.startDate.month}/${exp.startDate.year}` : '';
            const endDate = endDateValid ? (exp.endDate === 'Atual' ? 'Atual' : `${exp.endDate.month}/${exp.endDate.year}`) : '';
            const period = `${startDate}${startDateValid && endDateValid ? ' - ' : ''}${endDate}`;
            if (period) parts.push({ text: period, style: 'experiencePeriod' });
          }
          if (exp.description) parts.push({ text: exp.description, style: 'experienceDescription', margin: [0, 5, 0, 10] });
          return parts.length > 0 ? parts : null;
        })
        .filter(item => item !== null)
        .flat();

      if (experienceContent.length > 0) {
        content.push({ text: 'Experiência Profissional', style: 'sectionHeader' });
        content.push(...experienceContent);
      }
    }

    // Formação Acadêmica
    if (formData.education && formData.education.length > 0) {
      const educationContent = formData.education
        .filter(edu => edu.institution || edu.degree || (edu.startDate && edu.startDate.month && edu.startDate.year) || (edu.endDate && (edu.endDate === 'Atual' || (edu.endDate.month && edu.endDate.year))))
        .map(edu => {
          const parts = [];
          if (edu.institution) parts.push({ text: edu.institution, style: 'educationInstitution' });
          if (edu.degree) parts.push({ text: edu.degree, style: 'educationDegree' });
          const startDateValid = edu.startDate && edu.startDate.month && edu.startDate.year;
          const endDateValid = edu.endDate && (edu.endDate === 'Atual' || (edu.endDate.month && edu.endDate.year));
          if (startDateValid || endDateValid) {
            const startDate = startDateValid ? `${edu.startDate.month}/${edu.startDate.year}` : '';
            const endDate = endDateValid ? (edu.endDate === 'Atual' ? 'Atual' : `${edu.endDate.month}/${edu.endDate.year}`) : '';
            const period = `${startDate}${startDateValid && endDateValid ? ' - ' : ''}${endDate}`;
            if (period) parts.push({ text: period, style: 'educationPeriod' });
          }
          if (edu.description) parts.push({ text: edu.description, style: 'educationDescription', margin: [0, 5, 0, 10] });
          return parts.length > 0 ? parts : null;
        })
        .filter(item => item !== null)
        .flat();

      if (educationContent.length > 0) {
        content.push({ text: 'Formação Acadêmica', style: 'sectionHeader' });
        content.push(...educationContent);
      }
    }

    // Soft Skills
    if (formData.sections['Soft Skills']) {
      content.push({ text: 'Soft Skills', style: 'sectionHeader' });
      content.push({ text: formData.sections['Soft Skills'] });
    }

    // Diferenciais
    if (formData.sections['Diferenciais']) {
      content.push({ text: 'Diferenciais', style: 'sectionHeader' });
      content.push({ text: formData.sections['Diferenciais'] });
    }

    const docDefinition = {
      content: content,
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 8],
          color: '#0D0126'
        },
        subheader: {
          fontSize: 16,
          bold: false,
          margin: [0, 0, 0, 10],
          color: '#FF66C4'
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 15, 0, 8],
          color: '#FF66C4'
        },
        contactInfo: {
          fontSize: 10,
          marginBottom: 2,
          color: '#1A1038'
        },
        experienceCompany: {
          fontSize: 12,
          bold: true,
          color: '#1A1038',
          margin: [0, 5, 0, 0]
        },
        experienceTitle: {
          fontSize: 11,
          italics: true,
          color: '#1A1038',
          margin: [0, 3, 0, 0]
        },
        experiencePeriod: {
          fontSize: 10,
          color: '#777',
          margin: [0, 2, 0, 5]
        },
        experienceDescription: {
          fontSize: 10,
          color: '#333',
          margin: [0, 0, 0, 8]
        },
        educationInstitution: {
          fontSize: 12,
          bold: true,
          color: '#1A1038',
          margin: [0, 5, 0, 0]
        },
        educationDegree: {
          fontSize: 11,
          italics: true,
          color: '#1A1038',
          margin: [0, 3, 0, 0]
        },
        educationPeriod: {
          fontSize: 10,
          color: '#777',
          margin: [0, 2, 0, 5]
        },
        educationDescription: {
          fontSize: 10,
          color: '#333',
          margin: [0, 0, 0, 8]
        },
        skillCategory: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#1A1038'
        },
        skillSubcategoryText: {
          fontSize: 11,
          margin: [0, 2, 0, 2],
          color: '#333'
        }
      },
      defaultStyle: {
        fontSize: 11,
        color: '#333'
      }
    };

    const pdfDoc = new PDFDocument(fonts).createPdfKitDocument(docDefinition);
    const chunks = [];

    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(result);
    });

    pdfDoc.end();
  } catch (error) {
    console.error('Erro ao gerar o PDF:', error);
    res.status(500).send('Erro ao gerar o PDF');
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});