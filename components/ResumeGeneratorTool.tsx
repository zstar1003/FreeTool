import React, { useState, useCallback, useRef } from 'react';

// 简历数据类型
interface PersonalInfo {
    name: string;
    title: string;
    phone: string;
    email: string;
    location: string;
    website: string;
    summary: string;
}

interface Education {
    id: string;
    school: string;
    degree: string;
    major: string;
    gpa: string;
    startDate: string;
    endDate: string;
    descriptions: string[];
}

interface Experience {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    descriptions: string[];
}

interface Project {
    id: string;
    name: string;
    date: string;
    descriptions: string[];
}

interface ResumeData {
    personal: PersonalInfo;
    education: Education[];
    experience: Experience[];
    skills: { category: string; items: string }[];
    projects: Project[];
}

type SectionType = 'personal' | 'education' | 'experience' | 'projects' | 'skills';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultResumeData: ResumeData = {
    personal: {
        name: '',
        title: '',
        phone: '',
        email: '',
        location: '',
        website: '',
        summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
};

// 示例数据
const sampleResumeData: ResumeData = {
    personal: {
        name: '张三',
        title: '高级前端工程师',
        phone: '138-0000-0000',
        email: 'zhangsan@email.com',
        location: '北京市',
        website: 'github.com/zhangsan',
        summary: '5年前端开发经验，精通 React、Vue、TypeScript 等技术栈。具有丰富的大型项目开发经验，善于解决复杂的技术难题，注重代码质量和团队协作。',
    },
    education: [
        {
            id: '1',
            school: '北京大学',
            degree: '本科',
            major: '计算机科学与技术',
            gpa: '3.8/4.0',
            startDate: '2015.09',
            endDate: '2019.06',
            descriptions: ['主修课程：数据结构、算法设计、操作系统、计算机网络', '获得国家奖学金、优秀毕业生称号'],
        },
    ],
    experience: [
        {
            id: '1',
            company: '字节跳动',
            position: '高级前端工程师',
            location: '北京',
            startDate: '2021.06',
            endDate: '至今',
            descriptions: [
                '负责抖音创作者平台的前端架构设计与开发，日活用户超过500万',
                '主导前端性能优化项目，页面加载时间减少40%，首屏渲染时间缩短50%',
                '搭建前端组件库和工程化体系，提升团队开发效率30%',
            ],
        },
        {
            id: '2',
            company: '阿里巴巴',
            position: '前端工程师',
            location: '杭州',
            startDate: '2019.07',
            endDate: '2021.05',
            descriptions: [
                '参与淘宝商家后台系统开发，负责订单管理、数据分析等核心模块',
                '使用 React + TypeScript 重构遗留系统，代码可维护性大幅提升',
            ],
        },
    ],
    projects: [
        {
            id: '1',
            name: '开源组件库 StarUI',
            date: '2023.01 - 至今',
            descriptions: [
                '基于 React 18 和 TypeScript 构建的企业级 UI 组件库',
                'GitHub Star 2000+，npm 周下载量 5000+',
                '支持主题定制、国际化、无障碍访问等特性',
            ],
        },
    ],
    skills: [
        { category: '前端开发', items: 'React, Vue, TypeScript, JavaScript, HTML5, CSS3, Webpack, Vite' },
        { category: '后端技术', items: 'Node.js, Express, MongoDB, MySQL, Redis' },
        { category: '开发工具', items: 'Git, Docker, Jenkins, VS Code, Figma' },
    ],
};

const ResumeGeneratorTool: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
    const [activeSection, setActiveSection] = useState<SectionType>('personal');
    const [themeColor, setThemeColor] = useState('#0ea5e9');
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const resumeRef = useRef<HTMLDivElement>(null);

    const fontSizeMap = {
        small: { name: '18px', title: '10px', section: '10px', body: '9px', contact: '8px' },
        medium: { name: '20px', title: '11px', section: '11px', body: '10px', contact: '9px' },
        large: { name: '22px', title: '12px', section: '12px', body: '11px', contact: '10px' },
    };

    // 加载示例数据
    const loadSampleData = useCallback(() => {
        setResumeData(sampleResumeData);
    }, []);

    // 清空数据
    const clearData = useCallback(() => {
        setResumeData(defaultResumeData);
    }, []);

    // 更新个人信息
    const updatePersonal = useCallback((field: keyof PersonalInfo, value: string) => {
        setResumeData(prev => ({
            ...prev,
            personal: { ...prev.personal, [field]: value }
        }));
    }, []);

    // 添加教育经历
    const addEducation = useCallback(() => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, {
                id: generateId(),
                school: '',
                degree: '',
                major: '',
                gpa: '',
                startDate: '',
                endDate: '',
                descriptions: [''],
            }]
        }));
    }, []);

    const updateEducation = useCallback((id: string, field: keyof Education, value: string | string[]) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    }, []);

    const removeEducation = useCallback((id: string) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    }, []);

    // 添加工作经验
    const addExperience = useCallback(() => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: generateId(),
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                descriptions: [''],
            }]
        }));
    }, []);

    const updateExperience = useCallback((id: string, field: keyof Experience, value: string | string[]) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    }, []);

    const removeExperience = useCallback((id: string) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    }, []);

    // 添加项目经历
    const addProject = useCallback(() => {
        setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, {
                id: generateId(),
                name: '',
                date: '',
                descriptions: [''],
            }]
        }));
    }, []);

    const updateProject = useCallback((id: string, field: keyof Project, value: string | string[]) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.map(proj =>
                proj.id === id ? { ...proj, [field]: value } : proj
            )
        }));
    }, []);

    const removeProject = useCallback((id: string) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.filter(proj => proj.id !== id)
        }));
    }, []);

    // 技能管理
    const addSkillCategory = useCallback(() => {
        setResumeData(prev => ({
            ...prev,
            skills: [...prev.skills, { category: '', items: '' }]
        }));
    }, []);

    const updateSkill = useCallback((index: number, field: 'category' | 'items', value: string) => {
        setResumeData(prev => ({
            ...prev,
            skills: prev.skills.map((skill, i) =>
                i === index ? { ...skill, [field]: value } : skill
            )
        }));
    }, []);

    const removeSkill = useCallback((index: number) => {
        setResumeData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    }, []);

    // 导出 PDF
    const handleExport = useCallback(() => {
        const printContent = resumeRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('请允许弹出窗口以导出简历');
            return;
        }

        // 导出时使用更大的字号
        const exportFonts = {
            small: { name: '24px', title: '12px', section: '13px', body: '11px', contact: '10px' },
            medium: { name: '28px', title: '14px', section: '14px', body: '12px', contact: '11px' },
            large: { name: '32px', title: '16px', section: '15px', body: '13px', contact: '12px' },
        }[fontSize];

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${resumeData.personal.name || '简历'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: "Microsoft YaHei", "SimSun", -apple-system, BlinkMacSystemFont, sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page { size: A4; margin: 0; }
                    .resume {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm 20mm;
                        background: white;
                    }
                    .header { text-align: center; margin-bottom: 20px; }
                    .name { font-size: ${exportFonts.name}; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
                    .title { font-size: ${exportFonts.title}; color: #666; margin-bottom: 10px; }
                    .contact { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; font-size: ${exportFonts.contact}; color: #555; }
                    .contact-item { display: flex; align-items: center; gap: 4px; }
                    .summary { font-size: ${exportFonts.body}; color: #444; line-height: 1.6; text-align: justify; margin-top: 14px; }
                    .section { margin-bottom: 16px; }
                    .section-title {
                        font-size: ${exportFonts.section};
                        font-weight: 700;
                        color: ${themeColor};
                        border-bottom: 2px solid ${themeColor};
                        padding-bottom: 4px;
                        margin-bottom: 12px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .item { margin-bottom: 14px; }
                    .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
                    .item-title { font-size: ${exportFonts.body}; font-weight: 600; color: #1a1a1a; }
                    .item-subtitle { font-size: ${exportFonts.body}; color: #555; }
                    .item-date { font-size: ${exportFonts.contact}; color: #888; }
                    .item-meta { font-size: ${exportFonts.contact}; color: #666; margin-bottom: 4px; }
                    .descriptions { padding-left: 18px; }
                    .desc-item {
                        font-size: ${exportFonts.body};
                        color: #444;
                        line-height: 1.5;
                        margin-bottom: 3px;
                        position: relative;
                    }
                    .desc-item::before {
                        content: "•";
                        position: absolute;
                        left: -14px;
                        color: #666;
                    }
                    .skills-row { display: flex; margin-bottom: 8px; font-size: ${exportFonts.body}; }
                    .skill-category { font-weight: 600; color: #1a1a1a; min-width: 90px; }
                    .skill-items { color: #444; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    }, [fontSize, themeColor, resumeData.personal.name]);

    const sections: { id: SectionType; name: string; icon: string }[] = [
        { id: 'personal', name: '基本信息', icon: 'person' },
        { id: 'education', name: '教育经历', icon: 'school' },
        { id: 'experience', name: '工作经验', icon: 'work' },
        { id: 'projects', name: '项目经历', icon: 'folder' },
        { id: 'skills', name: '专业技能', icon: 'psychology' },
    ];

    const fonts = fontSizeMap[fontSize];

    return (
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-7xl flex-col items-center gap-2 text-center mb-6">
                <p className="text-3xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-4xl">
                    简历生成器
                </p>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    参考 OpenResume 设计，创建专业的 ATS 友好简历
                </p>
            </div>

            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧编辑区 */}
                <div className="flex flex-col gap-4">
                    {/* 工具栏 */}
                    <div className="flex flex-wrap gap-3 items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                        <div className="flex gap-2">
                            <button
                                onClick={loadSampleData}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">auto_fix</span>
                                加载示例
                            </button>
                            <button
                                onClick={clearData}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">delete</span>
                                清空
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* 字号选择 */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">字号</span>
                                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                    {(['small', 'medium', 'large'] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setFontSize(size)}
                                            className={`px-2 py-1 text-xs ${
                                                fontSize === size
                                                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* 主题色 */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">主题</span>
                                {['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#1a1a1a'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setThemeColor(color)}
                                        className={`w-5 h-5 rounded-full transition-transform ${
                                            themeColor === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 分段导航 */}
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    activeSection === section.id
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{section.icon}</span>
                                {section.name}
                            </button>
                        ))}
                    </div>

                    {/* 表单区域 */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 min-h-[400px]">
                        {/* 基本信息 */}
                        {activeSection === 'personal' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormInput label="姓名" value={resumeData.personal.name} onChange={(v) => updatePersonal('name', v)} placeholder="张三" />
                                    <FormInput label="职位" value={resumeData.personal.title} onChange={(v) => updatePersonal('title', v)} placeholder="高级前端工程师" />
                                    <FormInput label="电话" value={resumeData.personal.phone} onChange={(v) => updatePersonal('phone', v)} placeholder="138-0000-0000" />
                                    <FormInput label="邮箱" value={resumeData.personal.email} onChange={(v) => updatePersonal('email', v)} placeholder="email@example.com" />
                                    <FormInput label="所在地" value={resumeData.personal.location} onChange={(v) => updatePersonal('location', v)} placeholder="北京市" />
                                    <FormInput label="网站/GitHub" value={resumeData.personal.website} onChange={(v) => updatePersonal('website', v)} placeholder="github.com/username" />
                                </div>
                                <FormTextarea label="个人简介" value={resumeData.personal.summary} onChange={(v) => updatePersonal('summary', v)} placeholder="简要介绍您的背景、技能和职业目标..." rows={3} />
                            </div>
                        )}

                        {/* 教育经历 */}
                        {activeSection === 'education' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">添加您的教育背景</p>
                                    <button onClick={addEducation} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg">
                                        <span className="material-symbols-outlined text-lg">add</span>添加
                                    </button>
                                </div>
                                {resumeData.education.length === 0 ? (
                                    <EmptyState icon="school" text="点击添加按钮添加教育经历" />
                                ) : (
                                    resumeData.education.map((edu, idx) => (
                                        <FormCard key={edu.id} title={`教育经历 ${idx + 1}`} onDelete={() => removeEducation(edu.id)}>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormInput label="学校" value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} placeholder="北京大学" />
                                                <FormInput label="学历" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} placeholder="本科" />
                                                <FormInput label="专业" value={edu.major} onChange={(v) => updateEducation(edu.id, 'major', v)} placeholder="计算机科学" />
                                                <FormInput label="GPA" value={edu.gpa} onChange={(v) => updateEducation(edu.id, 'gpa', v)} placeholder="3.8/4.0" />
                                                <FormInput label="开始时间" value={edu.startDate} onChange={(v) => updateEducation(edu.id, 'startDate', v)} placeholder="2019.09" />
                                                <FormInput label="结束时间" value={edu.endDate} onChange={(v) => updateEducation(edu.id, 'endDate', v)} placeholder="2023.06" />
                                            </div>
                                            <BulletListInput
                                                label="描述（每行一条）"
                                                value={edu.descriptions}
                                                onChange={(v) => updateEducation(edu.id, 'descriptions', v)}
                                                placeholder="主修课程、获奖情况等"
                                            />
                                        </FormCard>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 工作经验 */}
                        {activeSection === 'experience' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">添加您的工作经历</p>
                                    <button onClick={addExperience} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg">
                                        <span className="material-symbols-outlined text-lg">add</span>添加
                                    </button>
                                </div>
                                {resumeData.experience.length === 0 ? (
                                    <EmptyState icon="work" text="点击添加按钮添加工作经验" />
                                ) : (
                                    resumeData.experience.map((exp, idx) => (
                                        <FormCard key={exp.id} title={`工作经验 ${idx + 1}`} onDelete={() => removeExperience(exp.id)}>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormInput label="公司" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} placeholder="字节跳动" />
                                                <FormInput label="职位" value={exp.position} onChange={(v) => updateExperience(exp.id, 'position', v)} placeholder="高级工程师" />
                                                <FormInput label="地点" value={exp.location} onChange={(v) => updateExperience(exp.id, 'location', v)} placeholder="北京" />
                                                <div className="flex gap-2">
                                                    <FormInput label="开始" value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} placeholder="2021.06" />
                                                    <FormInput label="结束" value={exp.endDate} onChange={(v) => updateExperience(exp.id, 'endDate', v)} placeholder="至今" />
                                                </div>
                                            </div>
                                            <BulletListInput
                                                label="工作描述（每行一条，使用数据量化成果）"
                                                value={exp.descriptions}
                                                onChange={(v) => updateExperience(exp.id, 'descriptions', v)}
                                                placeholder="负责xxx项目开发，实现了xxx功能，提升了xxx%"
                                            />
                                        </FormCard>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 项目经历 */}
                        {activeSection === 'projects' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">添加您的项目经历</p>
                                    <button onClick={addProject} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg">
                                        <span className="material-symbols-outlined text-lg">add</span>添加
                                    </button>
                                </div>
                                {resumeData.projects.length === 0 ? (
                                    <EmptyState icon="folder" text="点击添加按钮添加项目经历" />
                                ) : (
                                    resumeData.projects.map((proj, idx) => (
                                        <FormCard key={proj.id} title={`项目 ${idx + 1}`} onDelete={() => removeProject(proj.id)}>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormInput label="项目名称" value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} placeholder="开源组件库" />
                                                <FormInput label="时间" value={proj.date} onChange={(v) => updateProject(proj.id, 'date', v)} placeholder="2023.01 - 至今" />
                                            </div>
                                            <BulletListInput
                                                label="项目描述（每行一条）"
                                                value={proj.descriptions}
                                                onChange={(v) => updateProject(proj.id, 'descriptions', v)}
                                                placeholder="项目简介、技术栈、您的职责和成果"
                                            />
                                        </FormCard>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 专业技能 */}
                        {activeSection === 'skills' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">按类别添加您的技能</p>
                                    <button onClick={addSkillCategory} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg">
                                        <span className="material-symbols-outlined text-lg">add</span>添加分类
                                    </button>
                                </div>
                                {resumeData.skills.length === 0 ? (
                                    <EmptyState icon="psychology" text="点击添加分类按钮添加技能" />
                                ) : (
                                    resumeData.skills.map((skill, idx) => (
                                        <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex-shrink-0 w-28">
                                                <FormInput
                                                    label="分类名"
                                                    value={skill.category}
                                                    onChange={(v) => updateSkill(idx, 'category', v)}
                                                    placeholder="前端开发"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <FormInput
                                                    label="技能列表（用逗号分隔）"
                                                    value={skill.items}
                                                    onChange={(v) => updateSkill(idx, 'items', v)}
                                                    placeholder="React, Vue, TypeScript"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeSkill(idx)}
                                                className="mt-6 p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* 导出按钮 */}
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity"
                    >
                        <span className="material-symbols-outlined">download</span>
                        导出 PDF / 打印
                    </button>
                </div>

                {/* 右侧预览区 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">实时预览</span>
                        <span className="text-xs text-gray-500">A4</span>
                    </div>
                    <div className="p-4">
                        <div
                            ref={resumeRef}
                            className="bg-white shadow-xl mx-auto"
                            style={{
                                aspectRatio: '210 / 297',
                                width: '100%',
                                maxWidth: '595px',
                                padding: '32px 40px',
                            }}
                        >
                            {/* 头部 */}
                            <div className="header" style={{ textAlign: 'center', marginBottom: '12px' }}>
                                <div className="name" style={{ fontSize: fonts.name, fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
                                    {resumeData.personal.name || '您的姓名'}
                                </div>
                                {resumeData.personal.title && (
                                    <div style={{ fontSize: fonts.title, color: '#666', marginBottom: '6px' }}>
                                        {resumeData.personal.title}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', fontSize: fonts.contact, color: '#555' }}>
                                    {resumeData.personal.phone && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                            {resumeData.personal.phone}
                                        </span>
                                    )}
                                    {resumeData.personal.email && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                            {resumeData.personal.email}
                                        </span>
                                    )}
                                    {resumeData.personal.location && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                            {resumeData.personal.location}
                                        </span>
                                    )}
                                    {resumeData.personal.website && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                                            {resumeData.personal.website}
                                        </span>
                                    )}
                                </div>
                                {resumeData.personal.summary && (
                                    <div style={{ fontSize: fonts.body, color: '#444', lineHeight: 1.5, textAlign: 'justify', marginTop: '10px' }}>
                                        {resumeData.personal.summary}
                                    </div>
                                )}
                            </div>

                            {/* 教育经历 */}
                            {resumeData.education.length > 0 && (
                                <div className="section" style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: fonts.section, fontWeight: 700, color: themeColor, borderBottom: `1.5px solid ${themeColor}`, paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        教育经历
                                    </div>
                                    {resumeData.education.map((edu) => (
                                        <div key={edu.id} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                                <span style={{ fontSize: fonts.body, fontWeight: 600, color: '#1a1a1a' }}>{edu.school}</span>
                                                <span style={{ fontSize: fonts.contact, color: '#888' }}>{edu.startDate} - {edu.endDate}</span>
                                            </div>
                                            <div style={{ fontSize: fonts.contact, color: '#666', marginBottom: '3px' }}>
                                                {[edu.degree, edu.major, edu.gpa].filter(Boolean).join(' | ')}
                                            </div>
                                            {edu.descriptions.filter(d => d.trim()).length > 0 && (
                                                <div style={{ paddingLeft: '14px' }}>
                                                    {edu.descriptions.filter(d => d.trim()).map((desc, i) => (
                                                        <div key={i} style={{ fontSize: fonts.body, color: '#444', lineHeight: 1.4, marginBottom: '1px', position: 'relative' }}>
                                                            <span style={{ position: 'absolute', left: '-10px', color: '#666' }}>•</span>
                                                            {desc}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 工作经验 */}
                            {resumeData.experience.length > 0 && (
                                <div className="section" style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: fonts.section, fontWeight: 700, color: themeColor, borderBottom: `1.5px solid ${themeColor}`, paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        工作经验
                                    </div>
                                    {resumeData.experience.map((exp) => (
                                        <div key={exp.id} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                                <span style={{ fontSize: fonts.body, fontWeight: 600, color: '#1a1a1a' }}>{exp.company}</span>
                                                <span style={{ fontSize: fonts.contact, color: '#888' }}>{exp.startDate} - {exp.endDate}</span>
                                            </div>
                                            <div style={{ fontSize: fonts.contact, color: '#666', marginBottom: '3px' }}>
                                                {[exp.position, exp.location].filter(Boolean).join(' | ')}
                                            </div>
                                            {exp.descriptions.filter(d => d.trim()).length > 0 && (
                                                <div style={{ paddingLeft: '14px' }}>
                                                    {exp.descriptions.filter(d => d.trim()).map((desc, i) => (
                                                        <div key={i} style={{ fontSize: fonts.body, color: '#444', lineHeight: 1.4, marginBottom: '1px', position: 'relative' }}>
                                                            <span style={{ position: 'absolute', left: '-10px', color: '#666' }}>•</span>
                                                            {desc}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 项目经历 */}
                            {resumeData.projects.length > 0 && (
                                <div className="section" style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: fonts.section, fontWeight: 700, color: themeColor, borderBottom: `1.5px solid ${themeColor}`, paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        项目经历
                                    </div>
                                    {resumeData.projects.map((proj) => (
                                        <div key={proj.id} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                                <span style={{ fontSize: fonts.body, fontWeight: 600, color: '#1a1a1a' }}>{proj.name}</span>
                                                <span style={{ fontSize: fonts.contact, color: '#888' }}>{proj.date}</span>
                                            </div>
                                            {proj.descriptions.filter(d => d.trim()).length > 0 && (
                                                <div style={{ paddingLeft: '14px' }}>
                                                    {proj.descriptions.filter(d => d.trim()).map((desc, i) => (
                                                        <div key={i} style={{ fontSize: fonts.body, color: '#444', lineHeight: 1.4, marginBottom: '1px', position: 'relative' }}>
                                                            <span style={{ position: 'absolute', left: '-10px', color: '#666' }}>•</span>
                                                            {desc}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 专业技能 */}
                            {resumeData.skills.length > 0 && (
                                <div className="section" style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: fonts.section, fontWeight: 700, color: themeColor, borderBottom: `1.5px solid ${themeColor}`, paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        专业技能
                                    </div>
                                    {resumeData.skills.map((skill, idx) => (
                                        <div key={idx} style={{ display: 'flex', marginBottom: '4px', fontSize: fonts.body }}>
                                            <span style={{ fontWeight: 600, color: '#1a1a1a', minWidth: '70px' }}>{skill.category}：</span>
                                            <span style={{ color: '#444' }}>{skill.items}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 表单组件
const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
    <div className="flex-1">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
    </div>
);

const FormTextarea: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
    </div>
);

const BulletListInput: React.FC<{
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
    const text = value.join('\n');
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
            <textarea
                value={text}
                onChange={(e) => onChange(e.target.value.split('\n'))}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
        </div>
    );
};

const FormCard: React.FC<{
    title: string;
    onDelete: () => void;
    children: React.ReactNode;
}> = ({ title, onDelete, children }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-lg">delete</span>
            </button>
        </div>
        {children}
    </div>
);

const EmptyState: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <span className="material-symbols-outlined text-4xl mb-2">{icon}</span>
        <p className="text-sm">{text}</p>
    </div>
);

export default ResumeGeneratorTool;
