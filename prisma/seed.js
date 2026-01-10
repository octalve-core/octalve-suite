import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create team members
    const pm = await prisma.teamMember.upsert({
        where: { email: 'pm@octalve.local' },
        update: {},
        create: {
            email: 'pm@octalve.local',
            name: 'Project Manager',
            role: 'pm',
            activePhasesCount: 1,
        },
    });

    const designer = await prisma.teamMember.upsert({
        where: { email: 'designer@octalve.local' },
        update: {},
        create: {
            email: 'designer@octalve.local',
            name: 'Designer',
            role: 'designer',
            activePhasesCount: 1,
        },
    });

    console.log('Created team members:', pm.name, designer.name);

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@octalve.local' },
        update: {},
        create: {
            email: 'admin@octalve.local',
            fullName: 'Octalve Admin',
            role: 'admin',
        },
    });

    // Create client user
    const client = await prisma.user.upsert({
        where: { email: 'client@octalve.local' },
        update: {},
        create: {
            email: 'client@octalve.local',
            fullName: 'Demo Client',
            role: 'client',
        },
    });

    console.log('Created users:', admin.fullName, client.fullName);

    // Create template
    const template = await prisma.template.upsert({
        where: { id: 'launch-template-1' },
        update: {},
        create: {
            id: 'launch-template-1',
            name: 'Launch Suite Template',
            suiteType: 'launch',
            description: 'Standard 7–21 day Launch Suite delivery template',
            phases: JSON.stringify([
                {
                    name: 'Discovery & Kickoff',
                    order: 1,
                    description: 'Gather requirements and confirm scope.',
                    deliverables: [
                        { name: 'Kickoff notes', order: 1 },
                        { name: 'Requirements summary', order: 2 },
                    ],
                },
                {
                    name: 'Branding',
                    order: 2,
                    description: 'Logo + brand direction.',
                    deliverables: [
                        { name: 'Logo concepts', order: 1 },
                        { name: 'Brand guide', order: 2 },
                    ],
                },
                {
                    name: 'Website',
                    order: 3,
                    description: 'Landing page and core pages.',
                    deliverables: [
                        { name: 'Figma design', order: 1 },
                        { name: 'Staging link', order: 2 },
                    ],
                },
            ]),
        },
    });

    console.log('Created template:', template.name);

    // Check if sample project exists
    const existingProject = await prisma.project.findFirst({
        where: { projectCode: 'DEMO01' },
    });

    if (!existingProject) {
        // Create sample project
        const project = await prisma.project.create({
            data: {
                name: 'Octalve Suite MVP',
                clientName: 'Demo Client',
                clientEmail: 'client@octalve.local',
                suiteType: 'launch',
                status: 'active',
                progressPercentage: 20,
                assignedPmId: pm.id,
                targetCompletionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
                projectCode: 'DEMO01',
            },
        });

        console.log('Created project:', project.name);

        // Create phases
        const phase1 = await prisma.phase.create({
            data: {
                projectId: project.id,
                name: 'Discovery & Kickoff',
                order: 1,
                status: 'in_progress',
                description: 'Confirm scope and timelines.',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
            },
        });

        const phase2 = await prisma.phase.create({
            data: {
                projectId: project.id,
                name: 'Branding',
                order: 2,
                status: 'not_started',
                description: 'Logo and direction.',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
        });

        console.log('Created phases:', phase1.name, phase2.name);

        // Create deliverable
        const deliverable = await prisma.deliverable.create({
            data: {
                projectId: project.id,
                phaseId: phase1.id,
                name: 'Kickoff notes',
                link: 'https://example.com',
                linkType: 'web',
                status: 'ready_for_review',
                order: 1,
            },
        });

        console.log('Created deliverable:', deliverable.name);

        // Create approval
        const approval = await prisma.approval.create({
            data: {
                projectId: project.id,
                phaseId: phase1.id,
                requestedById: admin.id,
                status: 'pending',
            },
        });

        console.log('Created approval request');

        // Create message
        const message = await prisma.message.create({
            data: {
                projectId: project.id,
                phaseId: phase1.id,
                content: 'Kickoff started. Please review the scope and timelines.',
                senderId: admin.id,
                messageType: 'system',
                isResolved: false,
            },
        });

        console.log('Created message');
    } else {
        console.log('Sample project already exists, skipping...');
    }

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
