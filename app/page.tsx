import { useState } from 'react';

const skillsOptions = {
  Frontend: {
    Linguagens: [
      'JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3 (SASS, Flexbox, Grid)'
    ],
    'Frameworks e Bibliotecas': [
      'React.js', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS', 'Styled Components', 'Bootstrap'
    ],
    'Gerenciamento de Estado': [
      'Redux', 'Vuex'
    ],
    Performance: [
      'Lazy Loading', 'Code Splitting'
    ],
    'Acessibilidade e SEO': []
  },
  Backend: {
    Linguagens: [
      'Java (Spring Boot)', 'Node.js (Express.js)', 'Python', 'PHP'
    ],
    APIs: [
      'RESTful', 'GraphQL'
    ],
    Autenticação: [
      'JWT', 'OAuth 2.0'
    ],
    Arquitetura: [
      'Microservices', 'Serverless', 'Monólitos'
    ],
    Messageria: [
      'Kafka', 'RabbitMQ'
    ]
  },
  'Banco de Dados': {
    Relacionais: ['PostgreSQL', 'MySQL'],
    NoSQL: ['MongoDB', 'Redis'],
    'ORMs e Query Builders': ['Sequelize', 'Prisma', 'Hibernate']
  },
  'DevOps & Ferramentas': {
    Versionamento: ['Git (GitHub, GitLab)'],
    'Containers e CI/CD': ['Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins'],
    Cloud: ['AWS', 'Azure'],
    'Construção e automação': ['Webpack', 'Babel', 'NPM', 'Yarn']
  },
  'Testes & Qualidade': {
    Unitários: ['Jest', 'JUnit', 'PyTest'],
    'Integração e UI': ['Cypress', 'Playwright'],
    Monitoramento: ['Prometheus', 'Grafana']
  }
}

export default function CVPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    hasLinkedin: false,
    hasGithub: false,
    sections: {
      'Sobre mim': '',
      'Experiência Profissional': '',
      'Educação': '',
      'Soft Skills': '',
      'Diferenciais': '',
    },
    skills: Object.fromEntries(
      Object.entries(skillsOptions).map(([category, subcategories]) => [
        category,
        Object.fromEntries(Object.keys(subcategories).map(sub => [sub, []]))
      ])
    )
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name in formData.sections) {
      setFormData(prev => ({
        ...prev,
        sections: { ...prev.sections, [name]: value },
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSkillCheckboxChange = (category: string, subcategory: string, skill: string) => {
    setFormData(prev => {
      const currentSkills = prev.skills[category][subcategory] || []
      const updatedSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill]
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [category]: {
            ...prev.skills[category],
            [subcategory]: updatedSkills,
          }
        },
      }
    })
  }

  const handleSubmit = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'curriculo.pdf'
    link.click()
  }

  return (
    <>
      <Head>
        <title>Gerador de Currículo</title>
        <meta name="description" content="Crie seu currículo em PDF de forma prática e rápida." />
      </Head>
      <div className="min-h-screen bg-[#0D0126] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#FF66C4] mb-6">Gerador de Currículo</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Nome" className="p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            <input name="title" placeholder="Título Profissional" className="p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            <input name="email" placeholder="Email" className="p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            <input name="phone" placeholder="Telefone" className="p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            <input name="linkedin" placeholder="LinkedIn" className="p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            <input name="github" placeholder="GitHub" className="p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="hasLinkedin" checked={formData.hasLinkedin} onChange={handleChange} className="accent-[#FF66C4]" />
              <span>Possui LinkedIn</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="hasGithub" checked={formData.hasGithub} onChange={handleChange} className="accent-[#FF66C4]" />
              <span>Possui GitHub</span>
            </label>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl text-[#FF66C4] font-bold mb-2">Habilidades Técnicas</h2>
            {Object.entries(skillsOptions).map(([category, subcategories]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{category}</h3>
                {Object.entries(subcategories).map(([subcategory, options]) => (
                  <div key={subcategory} className="mb-3">
                    <label className="block mb-1 font-medium italic">{subcategory}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {options.map(option => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={option}
                            checked={formData.skills[category]?.[subcategory]?.includes(option)}
                            onChange={() => handleSkillCheckboxChange(category, subcategory, option)}
                            className="accent-[#FF66C4]"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {Object.entries(formData.sections).map(([section, content]) => (
            <div key={section} className="mt-4">
              <label className="block mb-1 text-[#FF66C4] font-bold">{section}</label>
              <textarea name={section} rows={4} className="w-full p-2 rounded bg-[#1A1038] text-white" onChange={handleChange} />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-6 bg-[#FF66C4] text-black font-bold px-6 py-2 rounded hover:bg-pink-400 transition"
          >
            Baixar PDF
          </button>
        </div>
      </div>
    </>
  )
}