import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
    pdf,
    Svg,
    Path,
} from '@react-pdf/renderer';

// 注册中文字体 - 使用 Noto Sans SC
Font.register({
    family: 'NotoSansSC',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/notosanssc/v39/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYw.ttf',
            fontWeight: 'normal'
        },
        {
            src: 'https://fonts.gstatic.com/s/notosanssc/v39/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaGzjCnYw.ttf',
            fontWeight: 'bold'
        },
    ],
});

// 禁用连字符断词
Font.registerHyphenationCallback(word => [word]);

// A4 尺寸（pt）
const A4_WIDTH_PT = 595;
const A4_HEIGHT_PT = 842;

// 简历数据类型
interface PersonalInfo {
    name: string;
    title: string;
    phone: string;
    email: string;
    location: string;
    website: string;
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

const generateId = () => Math.random().toString(36).slice(2, 11);

const defaultResumeData: ResumeData = {
    personal: {
        name: '',
        title: '',
        phone: '',
        email: '',
        location: '',
        website: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
};

// 示例数据
const sampleResumeData: ResumeData = {
    personal: {
        name: '我有一计',
        title: 'AI全栈工程师',
        phone: '138-0000-0000',
        email: 'zstar1003@163.com',
        location: '西安市',
        website: 'github.com/zstar1003',
    },
    education: [
        {
            id: '1',
            school: '西安电子科技大学',
            degree: '本科',
            major: '人工智能',
            gpa: '3.8/4.0',
            startDate: '2019.09',
            endDate: '2023.06',
            descriptions: ['主修课程：数据结构、算法设计、操作系统、计算机网络', '获得一等奖学金、优秀毕业生称号'],
        },
            {
            id: '2',
            school: '西安电子科技大学',
            degree: '硕士',
            major: '计算机科学与技术',
            gpa: '3.8/4.0',
            startDate: '2023.09',
            endDate: '2026.06',
            descriptions: ['主修课程：数据结构、算法设计、操作系统、计算机网络', '获得一等奖学金、优秀毕业生称号'],
        },
    ],
    experience: [
        {
            id: '1',
            company: '华为',
            position: 'AI应用工程师',
            location: '上海',
            startDate: '2021.06',
            endDate: '至今',
            descriptions: [
                '负责华为云创作者平台的前端架构设计与开发，日活用户超过500万',
                '主导前端性能优化项目，页面加载时间减少40%，首屏渲染时间缩短50%',
                '搭建前端组件库和工程化体系，提升团队开发效率30%',
            ],
        },
        {
            id: '2',
            company: '阿里巴巴',
            position: '算法工程师',
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
            name: '开源工具网站FreeTool',
            date: '2025.11 - 至今',
            descriptions: [
                '基于 React 18 和 TypeScript 构建的工具站',
                'GitHub Star 100+',
                '支持主题定制、国际化、无障碍访问等特性',
            ],
        },
        {
            id: '2',
            name: '开源软件FreePDF',
            date: '2025.9 - 至今',
            descriptions: [
                '基于 PDFMathTranslate 和 Python 构建的PDF双语文献阅读器',
                'GitHub Star 300+',
                '支持将各语言的PDF文献转成中文，并支持接入大模型基于文献内容进行问答',
            ],
        },
        {       
            id: '3',
            name: '开源软件FreeTex',
            date: '2025.9 - 至今',
            descriptions: [
                '基于 UniMERNet 和 Python 构建的公式智能识别软件',
                'GitHub Star 500+',
                '支持识别图像中的数学公式并将其转换为可编辑的Latex格式。',
            ],
        },
    ],
    skills: [
        { category: '前端开发', items: 'React, Vue, TypeScript, JavaScript, HTML5, CSS3, Webpack, Vite' },
        { category: '后端技术', items: 'Node.js, Express, MongoDB, MySQL, Redis' },
        { category: '开发工具', items: 'Git, Docker, Jenkins, VS Code, Figma' },
    ],
};

type SectionType = 'personal' | 'education' | 'experience' | 'projects' | 'skills';

// PDF 样式
const createPdfStyles = (themeColor: string, fontSize: number) => StyleSheet.create({
    page: {
        fontFamily: 'NotoSansSC',
        fontSize: fontSize,
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 50,
        paddingRight: 50,
        backgroundColor: '#ffffff',
    },
    header: {
        textAlign: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: fontSize + 10,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    title: {
        fontSize: fontSize,
        color: '#666666',
        marginBottom: 6,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 4,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        fontSize: fontSize - 1,
        color: '#555555',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: fontSize,
        fontWeight: 'bold',
        color: themeColor,
        borderBottomWidth: 1.5,
        borderBottomColor: themeColor,
        paddingBottom: 3,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    entryContainer: {
        marginBottom: 8,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 1,
    },
    entryTitle: {
        fontSize: fontSize - 1,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    entryDate: {
        fontSize: fontSize - 2,
        color: '#888888',
    },
    entrySubtitle: {
        fontSize: fontSize - 2,
        color: '#666666',
        marginBottom: 3,
    },
    bulletList: {
        paddingLeft: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 1,
    },
    bullet: {
        width: 8,
        fontSize: fontSize - 1,
        color: '#666666',
    },
    bulletText: {
        flex: 1,
        fontSize: fontSize - 1,
        color: '#444444',
        lineHeight: 1.4,
    },
    skillRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    skillCategory: {
        fontWeight: 'bold',
        color: '#1a1a1a',
        fontSize: fontSize - 1,
    },
    skillItems: {
        color: '#444444',
        fontSize: fontSize - 1,
        flex: 1,
    },
});

// PDF 图标组件
const PdfPhoneIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24">
        <Path fill="#555555" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </Svg>
);

const PdfEmailIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24">
        <Path fill="#555555" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </Svg>
);

const PdfLocationIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24">
        <Path fill="#555555" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </Svg>
);

const PdfWebsiteIcon = () => (
    <Svg width="10" height="10" viewBox="0 0 24 24">
        <Path fill="#555555" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </Svg>
);

// Resume PDF 文档组件（用于导出）
interface ResumePDFProps {
    resumeData: ResumeData;
    themeColor: string;
    fontSize: number;
}

const ResumePDFDocument: React.FC<ResumePDFProps> = ({ resumeData, themeColor, fontSize }) => {
    const styles = createPdfStyles(themeColor, fontSize);
    const { personal, education, experience, projects, skills } = resumeData;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* 头部信息 */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personal.name || '您的姓名'}</Text>
                    {personal.title && <Text style={styles.title}>{personal.title}</Text>}
                    <View style={styles.contactRow}>
                        {personal.phone && (
                            <View style={styles.contactItem}>
                                <PdfPhoneIcon />
                                <Text>{personal.phone}</Text>
                            </View>
                        )}
                        {personal.email && (
                            <View style={styles.contactItem}>
                                <PdfEmailIcon />
                                <Text>{personal.email}</Text>
                            </View>
                        )}
                        {personal.location && (
                            <View style={styles.contactItem}>
                                <PdfLocationIcon />
                                <Text>{personal.location}</Text>
                            </View>
                        )}
                        {personal.website && (
                            <View style={styles.contactItem}>
                                <PdfWebsiteIcon />
                                <Text>{personal.website}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 教育经历 */}
                {education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>教育经历</Text>
                        {education.map((edu) => (
                            <View key={edu.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{edu.school}</Text>
                                    <Text style={styles.entryDate}>{edu.startDate} - {edu.endDate}</Text>
                                </View>
                                <Text style={styles.entrySubtitle}>
                                    {[edu.degree, edu.major, edu.gpa].filter(Boolean).join(' | ')}
                                </Text>
                                {edu.descriptions.filter(d => d.trim()).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {edu.descriptions.filter(d => d.trim()).map((desc, i) => (
                                            <View key={i} style={styles.bulletItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text style={styles.bulletText}>{desc}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 工作经验 */}
                {experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>工作经验</Text>
                        {experience.map((exp) => (
                            <View key={exp.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{exp.company}</Text>
                                    <Text style={styles.entryDate}>{exp.startDate} - {exp.endDate}</Text>
                                </View>
                                <Text style={styles.entrySubtitle}>
                                    {[exp.position, exp.location].filter(Boolean).join(' | ')}
                                </Text>
                                {exp.descriptions.filter(d => d.trim()).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {exp.descriptions.filter(d => d.trim()).map((desc, i) => (
                                            <View key={i} style={styles.bulletItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text style={styles.bulletText}>{desc}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 项目经历 */}
                {projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>项目经历</Text>
                        {projects.map((proj) => (
                            <View key={proj.id} style={styles.entryContainer}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{proj.name}</Text>
                                    <Text style={styles.entryDate}>{proj.date}</Text>
                                </View>
                                {proj.descriptions.filter(d => d.trim()).length > 0 && (
                                    <View style={styles.bulletList}>
                                        {proj.descriptions.filter(d => d.trim()).map((desc, i) => (
                                            <View key={i} style={styles.bulletItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text style={styles.bulletText}>{desc}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 专业技能 */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>专业技能</Text>
                        {skills.map((skill, idx) => (
                            <View key={idx} style={styles.skillRow}>
                                <Text style={styles.skillCategory}>{skill.category}：</Text>
                                <Text style={styles.skillItems}>{skill.items}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

// HTML 预览组件（实时更新，无 PDF 工具栏）
interface ResumePreviewProps {
    resumeData: ResumeData;
    themeColor: string;
    fontSize: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, themeColor, fontSize }) => {
    const { personal, education, experience, projects, skills } = resumeData;

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: `${fontSize}pt`,
        fontWeight: 700,
        color: themeColor,
        borderBottom: `1.5pt solid ${themeColor}`,
        paddingBottom: '3pt',
        marginBottom: '8pt',
        textTransform: 'uppercase',
        letterSpacing: '1pt',
    };

    return (
        <div
            style={{
                fontFamily: '"Noto Sans SC", "Microsoft YaHei", sans-serif',
                fontSize: `${fontSize}pt`,
                paddingTop: '40pt',
                paddingBottom: '40pt',
                paddingLeft: '50pt',
                paddingRight: '50pt',
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                lineHeight: 1.4,
                height: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* 头部信息 */}
            <div style={{ textAlign: 'center', marginBottom: '12pt' }}>
                <div style={{ fontSize: `${fontSize + 10}pt`, fontWeight: 700, color: '#1a1a1a', marginBottom: '2pt' }}>
                    {personal.name || '您的姓名'}
                </div>
                {personal.title && (
                    <div style={{ fontSize: `${fontSize}pt`, color: '#666666', marginBottom: '6pt' }}>
                        {personal.title}
                    </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12pt', marginBottom: '4pt' }}>
                    {personal.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt', fontSize: `${fontSize - 1}pt`, color: '#555555' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#555555"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                            {personal.phone}
                        </span>
                    )}
                    {personal.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt', fontSize: `${fontSize - 1}pt`, color: '#555555' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#555555"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                            {personal.email}
                        </span>
                    )}
                    {personal.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt', fontSize: `${fontSize - 1}pt`, color: '#555555' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#555555"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            {personal.location}
                        </span>
                    )}
                    {personal.website && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt', fontSize: `${fontSize - 1}pt`, color: '#555555' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#555555"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            {personal.website}
                        </span>
                    )}
                </div>
            </div>

            {/* 教育经历 */}
            {education.length > 0 && (
                <div style={{ marginBottom: '10pt' }}>
                    <div style={sectionTitleStyle}>教育经历</div>
                    {education.map((edu) => (
                        <div key={edu.id} style={{ marginBottom: '8pt' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1pt' }}>
                                <span style={{ fontSize: `${fontSize - 1}pt`, fontWeight: 600, color: '#1a1a1a' }}>{edu.school}</span>
                                <span style={{ fontSize: `${fontSize - 2}pt`, color: '#888888' }}>{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <div style={{ fontSize: `${fontSize - 2}pt`, color: '#666666', marginBottom: '3pt' }}>
                                {[edu.degree, edu.major, edu.gpa].filter(Boolean).join(' | ')}
                            </div>
                            {edu.descriptions.filter(d => d.trim()).length > 0 && (
                                <div style={{ paddingLeft: '12pt' }}>
                                    {edu.descriptions.filter(d => d.trim()).map((desc, i) => (
                                        <div key={i} style={{ fontSize: `${fontSize - 1}pt`, color: '#444444', lineHeight: 1.4, marginBottom: '1pt', display: 'flex' }}>
                                            <span style={{ width: '8pt', color: '#666666' }}>•</span>
                                            <span style={{ flex: 1 }}>{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 工作经验 */}
            {experience.length > 0 && (
                <div style={{ marginBottom: '10pt' }}>
                    <div style={sectionTitleStyle}>工作经验</div>
                    {experience.map((exp) => (
                        <div key={exp.id} style={{ marginBottom: '8pt' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1pt' }}>
                                <span style={{ fontSize: `${fontSize - 1}pt`, fontWeight: 600, color: '#1a1a1a' }}>{exp.company}</span>
                                <span style={{ fontSize: `${fontSize - 2}pt`, color: '#888888' }}>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div style={{ fontSize: `${fontSize - 2}pt`, color: '#666666', marginBottom: '3pt' }}>
                                {[exp.position, exp.location].filter(Boolean).join(' | ')}
                            </div>
                            {exp.descriptions.filter(d => d.trim()).length > 0 && (
                                <div style={{ paddingLeft: '12pt' }}>
                                    {exp.descriptions.filter(d => d.trim()).map((desc, i) => (
                                        <div key={i} style={{ fontSize: `${fontSize - 1}pt`, color: '#444444', lineHeight: 1.4, marginBottom: '1pt', display: 'flex' }}>
                                            <span style={{ width: '8pt', color: '#666666' }}>•</span>
                                            <span style={{ flex: 1 }}>{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 项目经历 */}
            {projects.length > 0 && (
                <div style={{ marginBottom: '10pt' }}>
                    <div style={sectionTitleStyle}>项目经历</div>
                    {projects.map((proj) => (
                        <div key={proj.id} style={{ marginBottom: '8pt' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1pt' }}>
                                <span style={{ fontSize: `${fontSize - 1}pt`, fontWeight: 600, color: '#1a1a1a' }}>{proj.name}</span>
                                <span style={{ fontSize: `${fontSize - 2}pt`, color: '#888888' }}>{proj.date}</span>
                            </div>
                            {proj.descriptions.filter(d => d.trim()).length > 0 && (
                                <div style={{ paddingLeft: '12pt' }}>
                                    {proj.descriptions.filter(d => d.trim()).map((desc, i) => (
                                        <div key={i} style={{ fontSize: `${fontSize - 1}pt`, color: '#444444', lineHeight: 1.4, marginBottom: '1pt', display: 'flex' }}>
                                            <span style={{ width: '8pt', color: '#666666' }}>•</span>
                                            <span style={{ flex: 1 }}>{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 专业技能 */}
            {skills.length > 0 && (
                <div style={{ marginBottom: '10pt' }}>
                    <div style={sectionTitleStyle}>专业技能</div>
                    {skills.map((skill, idx) => (
                        <div key={idx} style={{ display: 'flex', marginBottom: '4pt', fontSize: `${fontSize - 1}pt` }}>
                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{skill.category}：</span>
                            <span style={{ color: '#444444', flex: 1 }}>{skill.items}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ResumeGeneratorTool: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
    const [activeSection, setActiveSection] = useState<SectionType>('personal');
    const [themeColor, setThemeColor] = useState('#0ea5e9');
    const [bodyFontSize, setBodyFontSize] = useState(12);
    const [isExporting, setIsExporting] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.6);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // A4 尺寸转换为像素 (1pt = 1.333px at 96dpi)
    const A4_WIDTH_PX = A4_WIDTH_PT * 1.333;
    const A4_HEIGHT_PX = A4_HEIGHT_PT * 1.333;

    // 计算预览缩放比例，确保宽高都能适应容器
    useEffect(() => {
        const updateScale = () => {
            if (previewContainerRef.current) {
                const containerWidth = previewContainerRef.current.clientWidth - 32;
                const containerHeight = previewContainerRef.current.clientHeight - 32;
                const scaleX = containerWidth / A4_WIDTH_PX;
                const scaleY = containerHeight / A4_HEIGHT_PX;
                const scale = Math.min(scaleX, scaleY, 1);
                setPreviewScale(scale);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);

        // 使用 ResizeObserver 监听容器尺寸变化
        const resizeObserver = new ResizeObserver(updateScale);
        if (previewContainerRef.current) {
            resizeObserver.observe(previewContainerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateScale);
            resizeObserver.disconnect();
        };
    }, [A4_WIDTH_PX, A4_HEIGHT_PX]);

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
    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const doc = <ResumePDFDocument resumeData={resumeData} themeColor={themeColor} fontSize={bodyFontSize} />;
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = resumeData.personal.name ? `${resumeData.personal.name}_简历.pdf` : '简历.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF 导出失败:', error);
            alert('PDF 导出失败，请重试');
        } finally {
            setIsExporting(false);
        }
    }, [resumeData, themeColor, bodyFontSize]);

    const sections: { id: SectionType; name: string; icon: string }[] = [
        { id: 'personal', name: '基本信息', icon: 'person' },
        { id: 'education', name: '教育经历', icon: 'school' },
        { id: 'experience', name: '工作经验', icon: 'work' },
        { id: 'projects', name: '项目经历', icon: 'folder' },
        { id: 'skills', name: '专业技能', icon: 'psychology' },
    ];

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
                        <div className="flex items-center gap-4">
                            {/* 字号选择 */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">字号</span>
                                <input
                                    type="number"
                                    min="8"
                                    max="14"
                                    value={bodyFontSize}
                                    onChange={(e) => setBodyFontSize(Math.min(14, Math.max(8, parseInt(e.target.value) || 11)))}
                                    className="w-14 px-2 py-1 text-xs text-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                                <span className="text-xs text-gray-400">pt</span>
                            </div>
                            {/* 主题色 */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">主题</span>
                                <div className="flex items-center gap-1.5">
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
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
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
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                导出中...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">download</span>
                                导出 PDF
                            </>
                        )}
                    </button>
                </div>

                {/* 右侧预览区 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden flex flex-col h-[850px] self-start sticky top-4">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">实时预览</span>
                        <span className="text-xs text-gray-500">A4 ({Math.round(previewScale * 100)}%)</span>
                    </div>
                    <div
                        ref={previewContainerRef}
                        className="flex-1 p-4 flex justify-center items-start overflow-hidden"
                    >
                        <div
                            className="bg-white shadow-xl"
                            style={{
                                width: `${A4_WIDTH_PT}pt`,
                                height: `${A4_HEIGHT_PT}pt`,
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'top center',
                                flexShrink: 0,
                            }}
                        >
                            <ResumePreview
                                resumeData={resumeData}
                                themeColor={themeColor}
                                fontSize={bodyFontSize}
                            />
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
