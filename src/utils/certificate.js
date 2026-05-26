export const generateCertificateImage = async (courseData, user, courseId) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const W = 1400;
      const H = 1000;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // ── Background ──
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#0f0c29');
      bgGrad.addColorStop(0.5, '#302b63');
      bgGrad.addColorStop(1, '#24243e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Inner card ──
      const pad = 40;
      const rx = 20;
      const cardW = W - pad * 2;
      const cardH = H - pad * 2;
      ctx.beginPath();
      ctx.moveTo(pad + rx, pad);
      ctx.lineTo(pad + cardW - rx, pad);
      ctx.arcTo(pad + cardW, pad, pad + cardW, pad + rx, rx);
      ctx.lineTo(pad + cardW, pad + cardH - rx);
      ctx.arcTo(pad + cardW, pad + cardH, pad + cardW - rx, pad + cardH, rx);
      ctx.lineTo(pad + rx, pad + cardH);
      ctx.arcTo(pad, pad + cardH, pad, pad + cardH - rx, rx);
      ctx.lineTo(pad, pad + rx);
      ctx.arcTo(pad, pad, pad + rx, pad, rx);
      ctx.closePath();
      const cardGrad = ctx.createLinearGradient(pad, pad, pad + cardW, pad + cardH);
      cardGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
      cardGrad.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = cardGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Decorative corner accents ──
      const drawCorner = (cx, cy, angle) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        const accentGrad = ctx.createLinearGradient(0, 0, 60, 60);
        accentGrad.addColorStop(0, 'rgba(139,92,246,0.6)');
        accentGrad.addColorStop(1, 'rgba(139,92,246,0)');
        ctx.strokeStyle = accentGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(pad + 15, pad + 15, 0);
      drawCorner(W - pad - 15, pad + 15, Math.PI / 2);
      drawCorner(W - pad - 15, H - pad - 15, Math.PI);
      drawCorner(pad + 15, H - pad - 15, -Math.PI / 2);

      // ── Subtle glow circles ──
      const drawGlow = (x, y, r, color) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      };
      drawGlow(200, 200, 300, 'rgba(139,92,246,0.08)');
      drawGlow(W - 200, H - 200, 300, 'rgba(99,102,241,0.08)');

      // ── EduFlow Logo ──
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦  EduFlow', W / 2, 110);

      // ── "CERTIFICATE OF COMPLETION" ──
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '600 14px Arial, sans-serif';
      ctx.fillText('CERTIFICATE  OF  COMPLETION', W / 2, 160);

      // ── Divider line ──
      const lineGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
      lineGrad.addColorStop(0, 'rgba(139,92,246,0)');
      lineGrad.addColorStop(0.5, 'rgba(139,92,246,0.6)');
      lineGrad.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 200, 180);
      ctx.lineTo(W / 2 + 200, 180);
      ctx.stroke();

      // ── "This certifies that" ──
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('This is to certify that', W / 2, 240);

      // ── Student Name ──
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Georgia, serif';
      ctx.fillText(user?.name || 'Student', W / 2, 310);

      // ── Underline under name ──
      const nameWidth = ctx.measureText(user?.name || 'Student').width;
      const nlGrad = ctx.createLinearGradient(W / 2 - nameWidth / 2, 0, W / 2 + nameWidth / 2, 0);
      nlGrad.addColorStop(0, 'rgba(139,92,246,0)');
      nlGrad.addColorStop(0.3, 'rgba(139,92,246,0.5)');
      nlGrad.addColorStop(0.7, 'rgba(139,92,246,0.5)');
      nlGrad.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.strokeStyle = nlGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - nameWidth / 2 - 20, 325);
      ctx.lineTo(W / 2 + nameWidth / 2 + 20, 325);
      ctx.stroke();

      // ── "has successfully completed" ──
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('has successfully completed the course', W / 2, 380);

      // ── Course Title ──
      ctx.fillStyle = '#c4b5fd';
      ctx.font = 'bold 36px Arial, sans-serif';
      let title = courseData?.course_title || (courseData?.course?.title) || 'Course';
      if (title.length > 45) title = title.substring(0, 42) + '...';
      ctx.fillText(title, W / 2, 440);

      // ── Course stats ──
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(
        `${courseData?.total_lessons || 0} lessons  •  ${courseData?.completion_percentage || courseData?.progress_percent || 100}% completed`,
        W / 2,
        485
      );

      // ── Divider ──
      ctx.strokeStyle = lineGrad;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 200, 520);
      ctx.lineTo(W / 2 + 200, 520);
      ctx.stroke();

      // ── Date ──
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Date of Completion', W / 2 - 250, 580);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(dateStr, W / 2 - 250, 610);

      // ── Student Code ──
      if (user?.student_code) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText('Student Code', W / 2, 580);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText(user.student_code, W / 2, 610);
      }

      // ── Certificate ID ──
      const safeCourseId = courseId || courseData?.course?.id || courseData?.id || 'COURSE';
      const certId = `EF-${safeCourseId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Certificate ID', W / 2 + 250, 580);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(certId, W / 2 + 250, 610);

      // ── Signature lines ──
      const drawSigLine = (x, label) => {
        const slGrad = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
        slGrad.addColorStop(0, 'rgba(255,255,255,0)');
        slGrad.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        slGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = slGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 80, 720);
        ctx.lineTo(x + 80, 720);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText(label, x, 745);
      };
      drawSigLine(W / 2 - 250, 'INSTRUCTOR');
      drawSigLine(W / 2 + 250, 'DIRECTOR');

      // ── EduFlow tagline at bottom ──
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText('EduFlow Learning Management System  •  eduflow.com', W / 2, H - 60);

      // ── Star decorations ──
      const drawStar = (x, y, size, opacity) => {
        ctx.fillStyle = `rgba(139,92,246,${opacity})`;
        ctx.font = `${size}px Arial, sans-serif`;
        ctx.fillText('✦', x, y);
      };
      drawStar(120, 500, 20, 0.15);
      drawStar(W - 120, 300, 16, 0.12);
      drawStar(200, 800, 14, 0.1);
      drawStar(W - 180, 750, 18, 0.13);

      // Convert to Data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
};
