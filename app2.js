let tmr;

async function muatDaftar() {
  const q = $('q').value.trim().replace(/[%,()*]/g, '');
  let r = sb.from('patients').select('id,no_rm,nama,nik,no_hp,tanggal_lahir,jenis_kelamin')
    .is('deleted_at', null).order('updated_at', { ascending: false }).limit(50);
  if (q) r = r.or(nama.ilike.%${q}%,no_rm.ilike.%${q}%,nik.ilike.%${q}%,no_hp.ilike.%${q}%);
  const { data, error } = await r;
  if (error) { $('list').innerHTML = '<div class="err">Gagal memuat data: ' + esc(error.message) + '</div>'; return; }
  $('list').innerHTML = data.length ? data.map(p =>
    <div class="row" data-id="${esc(p.id)}"><span class="rm">${esc(p.no_rm)}</span> &nbsp;<strong>${esc(p.nama)}</strong><br>
     <small>${esc([p.jenis_kelamin, umur(p.tanggal_lahir), p.no_hp].filter(Boolean).join(' · '))}</small></div>
  ).join('') : '<small style="color:var(--mut)">Belum ada pasien.</small>';
}

async function detail(id) {
  const [a, b] = await Promise.all([
    sb.from('patients').select('*').eq('id', id).single(),
    sb.from('patient_medical_history').select('*').eq('patient_id', id).is('deleted_at', null).limit(1)
  ]);
  if (a.error) { alert('Gagal memuat pasien.'); return; }
  const p = a.data, h = (b.data && b.data[0]) || {};
  const rows = [
    ['Nomor RM', p.no_rm], ['Nama', p.nama], ['NIK', p.nik], ['Nomor BPJS', p.no_bpjs],
    ['Jenis kelamin', p.jenis_kelamin],
    ['Tempat, tanggal lahir', [p.tempat_lahir, p.tanggal_lahir].filter(Boolean).join(', ') + (p.tanggal_lahir ? ' (' + umur(p.tanggal_lahir) + ')' : '')],
    ['Nomor HP', p.no_hp], ['Pekerjaan', p.pekerjaan], ['Alamat', p.alamat],
    ['Penanggung jawab', [p.penanggung_jawab, p.no_hp_pj].filter(Boolean).join(' · ')],
    ['Alergi', h.alergi], ['Penyakit sistemik', h.penyakit_sistemik], ['Obat rutin', h.obat_rutin]
  ];
  $('dlgBody').innerHTML = '<h2>' + esc(p.nama) + '</h2><dl>' +
    rows.filter(r => r[1]).map(r => <dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>).join('') + '</dl>';
  $('dlg').showModal();
}
