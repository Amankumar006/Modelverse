import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PENDING_DIR = path.join(process.cwd(), 'data', 'models-pending');
const PROD_DIR = path.join(process.cwd(), 'data', 'models');

const CURATOR_SECRET = process.env.CURATOR_SECRET || 'curator-secret-123';

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const headerSecret = request.headers.get('x-curator-secret');
  return querySecret === CURATOR_SECRET || headerSecret === CURATOR_SECRET;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing curator secret key.' }, { status: 401 });
  }

  try {
    if (!fs.existsSync(PENDING_DIR)) {
      fs.mkdirSync(PENDING_DIR, { recursive: true });
    }

    const files = fs.readdirSync(PENDING_DIR).filter((f) => f.endsWith('.json'));
    const pendingModels = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(PENDING_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        pendingModels.push({ filename: file, ...data });
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      count: pendingModels.length,
      models: pendingModels,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.clone().json().catch(() => ({}));
  const bodySecret = body.secret;
  
  if (!isAuthorized(request) && bodySecret !== CURATOR_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing curator secret key.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { action, filename, humanNotes } = body;

    if (action === 'approve_all_clean') {
      const files = fs.existsSync(PENDING_DIR) ? fs.readdirSync(PENDING_DIR).filter((f) => f.endsWith('.json')) : [];
      let approvedCount = 0;

      for (const file of files) {
        const filePath = path.join(PENDING_DIR, file);
        try {
          const model = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const conf = model.fieldConfidence || {};
          const confValues = Object.values(conf);

          // Check if zero fields are DISPUTED, and non-benchmark fields are clean
          const isDisputed = confValues.includes('DISPUTED') || model.verificationStatus === 'DISPUTED';
          const nonBenchmarkValues = Object.entries(conf)
            .filter(([k]) => k !== 'benchmarks')
            .map(([, v]) => v);
          
          const nonBenchmarkClean = nonBenchmarkValues.every((v) => v === 'VERIFIED' || v === 'LIKELY');

          if (!isDisputed && (nonBenchmarkClean || nonBenchmarkValues.length === 0)) {
            model.humanApproved = true;
            model.verified = true;
            model.verificationStatus = 'VERIFIED';
            model.needsReview = false;
            model.curatorNotes = (model.curatorNotes || '') + '\n[Bulk-Approve] Promoted via clean non-benchmark bulk approval.';

            if (!fs.existsSync(PROD_DIR)) fs.mkdirSync(PROD_DIR, { recursive: true });
            fs.writeFileSync(path.join(PROD_DIR, file), JSON.stringify(model, null, 2), 'utf-8');
            fs.unlinkSync(filePath);
            approvedCount++;
          }
        } catch (e) {}
      }

      if (approvedCount > 0) {
        try {
          const { execSync } = require('child_process');
          execSync('node scripts/compile-models.js', { stdio: 'inherit' });
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Bulk-approved and promoted ${approvedCount} clean candidates to production!`,
      });
    }

    if (!filename || !action) {
      return NextResponse.json({ success: false, error: 'Missing filename or action' }, { status: 400 });
    }

    const pendingPath = path.join(PENDING_DIR, filename);
    if (!fs.existsSync(pendingPath)) {
      return NextResponse.json({ success: false, error: 'Pending model file not found' }, { status: 404 });
    }

    if (action === 'reject') {
      try {
        const raw = fs.readFileSync(pendingPath, 'utf-8');
        const model = JSON.parse(raw);
        const trackingDir = path.join(process.cwd(), 'data', 'tracking');
        if (!fs.existsSync(trackingDir)) fs.mkdirSync(trackingDir, { recursive: true });
        const tombstonePath = path.join(trackingDir, 'rejected-models.json');
        let tombstones: string[] = [];
        if (fs.existsSync(tombstonePath)) {
          try { tombstones = JSON.parse(fs.readFileSync(tombstonePath, 'utf-8')); } catch (e) {}
        }
        if (model.id && !tombstones.includes(model.id)) tombstones.push(model.id);
        if (model.slug && !tombstones.includes(model.slug)) tombstones.push(model.slug);
        fs.writeFileSync(tombstonePath, JSON.stringify(tombstones, null, 2), 'utf-8');
      } catch (e) {}

      fs.unlinkSync(pendingPath);
      return NextResponse.json({ success: true, message: `Rejected and removed ${filename}` });
    }

    if (action === 'approve') {
      const raw = fs.readFileSync(pendingPath, 'utf-8');
      const model = JSON.parse(raw);

      model.humanApproved = true;
      model.verified = true;
      model.verificationStatus = 'VERIFIED';
      model.needsReview = false;
      if (humanNotes) {
        model.curatorNotes = (model.curatorNotes || '') + `\nCurator Approval Note: ${humanNotes}`;
      }

      // Move to production directory
      if (!fs.existsSync(PROD_DIR)) fs.mkdirSync(PROD_DIR, { recursive: true });
      fs.writeFileSync(path.join(PROD_DIR, filename), JSON.stringify(model, null, 2), 'utf-8');
      fs.unlinkSync(pendingPath);

      // Trigger compilation
      try {
        const { execSync } = require('child_process');
        execSync('node scripts/compile-models.js', { stdio: 'inherit' });
      } catch (e) {}

      return NextResponse.json({ success: true, message: `Approved and promoted ${filename} to production!` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
