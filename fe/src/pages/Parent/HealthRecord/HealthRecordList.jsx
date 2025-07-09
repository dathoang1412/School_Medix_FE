import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown, ChevronUp, FileText, Calendar, Clock, MapPin, Pill, User, Activity, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import axiosClient from '../../../config/axiosClient';
import { ChildContext } from '../../../layouts/ParentLayout';

const HealthRecordList = () => {
  const { handleSelectChild, children } = useContext(ChildContext);
  const [recs, setRecs] = useState([]);
  const [filtRecs, setFiltRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expRows, setExpRows] = useState(new Set());
  const [err, setErr] = useState('');
  const [dateFilt, setDateFilt] = useState('');
  const [sort, setSort] = useState({ key: 'detect_date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const recsPerPage = 10;
  const [child, setChild] = useState(null);

  const fmtDate = (d, forInput = false) => {
    if (!d) return forInput ? '' : 'Chưa xác định';
    try {
      const dt = new Date(d);
      return forInput ? dt.toISOString().split('T')[0] : dt.toLocaleDateString('vi-VN');
    } catch {
      return forInput ? '' : 'Chưa xác định';
    }
  };

  const isToday = (d) => d ? new Date(d).toDateString() === new Date().toDateString() : false;

  useEffect(() => {
    const selChild = children.find(c => c.id === JSON.parse(localStorage.getItem("selectedChild"))?.id) || JSON.parse(localStorage.getItem("selectedChild"));
    if (selChild) {
      setChild(selChild);
      handleSelectChild(selChild);
    }
  }, [children, handleSelectChild]);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    axiosClient.get(`student/${child.id}/disease-record`)
      .then(({ data }) => {
        if (!data.error && data.data) {
          setRecs(data.data);
          setFiltRecs(data.data);
        } else {
          setErr(data.message || 'Không thể tải hồ sơ bệnh');
        }
      })
      .catch(e => {
        setErr('Không thể tải hồ sơ bệnh');
        console.error('Error fetching disease records:', e);
      })
      .finally(() => setLoading(false));
  }, [child]);

  useEffect(() => {
    let filtered = recs.filter(r => !dateFilt || [r.detect_date, r.cure_date].some(d => fmtDate(d, true) === dateFilt));
    filtered.sort((a, b) => {
      const dA = new Date(a[sort.key]), dB = new Date(b[sort.key]);
      return sort.dir === 'asc' ? dA - dB : dB - dA;
    });
    setFiltRecs(filtered);
    setPage(1);
  }, [dateFilt, recs, sort]);

  const sortBy = key => setSort({ key, dir: sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc' });

  const toggleRow = id => setExpRows(new Set(expRows.has(id) ? [] : [id]));

  const filtToday = () => setDateFilt(new Date().toISOString().split('T')[0]);

  const clearFilt = () => setDateFilt('');

  const last = page * recsPerPage, first = last - recsPerPage;
  const currRecs = filtRecs.slice(first, last);
  const totalPages = Math.ceil(filtRecs.length / recsPerPage);
  const todayCount = recs.filter(r => isToday(r.detect_date) || isToday(r.cure_date)).length;

  const badge = r => {
    const cls = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm';
    if (r.status === 'RECOVERED') return <span className={`${cls} bg-green-50 text-green-700 border-green-200`}><CheckCircle className="w-4 h-4" /> Đã khỏi</span>;
    if (r.status === 'UNDER_TREATMENT') return <span className={`${cls} bg-amber-50 text-amber-700 border-amber-200`}><Clock className="w-4 h-4" /> Đang điều trị</span>;
    return <span className={`${cls} bg-gray-50 text-gray-700 border-gray-200`}><XCircle className="w-4 h-4" /> Không xác định</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg"><Shield className="w-8 h-8 text-blue-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hồ sơ bệnh</h1>
              <p className="text-gray-600">Theo dõi hồ sơ bệnh của con em tại trường</p>
              {child && <p className="text-sm font-medium text-gray-700 mt-2">Học sinh: HS{String(child.id).padStart(6, '0')}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Tổng hồ sơ: </span><span className="font-medium text-blue-600">{recs.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Hôm nay: </span><span className="font-medium text-blue-600">{todayCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {err && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm flex items-center gap-2"><XCircle className="w-5 h-5" />{err}</div>}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc theo ngày</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative">
              <input type="date" value={dateFilt} onChange={e => setDateFilt(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
            <div className="flex gap-2">
              <button onClick={filtToday} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"><Clock className="w-4 h-4" /> Hôm nay</button>
              <button onClick={clearFilt} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Xóa bộ lọc</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => sortBy('detect_date')}>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày Phát Hiện {sort.key === 'detect_date' && (sort.dir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}</div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700"><div className="flex items-center gap-2"><Pill className="w-4 h-4" /> Tên Bệnh</div></th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700"><div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Chẩn Đoán</div></th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center"><div className="flex flex-col items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" /><p className="text-gray-600 text-sm">Đang tải dữ liệu...</p></div></td></tr>
                ) : currRecs.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center"><FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-900 text-lg font-semibold">Không tìm thấy hồ sơ</p><p className="text-gray-600 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc liên hệ với nhà trường</p></td></tr>
                ) : (
                  currRecs.map(r => (
                    <React.Fragment key={r.id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-700"><div className="flex items-center gap-2">{isToday(r.detect_date) && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}{fmtDate(r.detect_date)}</div></td>
                        <td className="p-4 text-sm text-gray-800 font-medium">{r.disease_name || 'Không xác định'}</td>
                        <td className="p-4 text-sm text-gray-800 font-medium">{r.diagnosis || 'Chưa có chẩn đoán'}</td>
                        <td className="p-4">{badge(r)}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => toggleRow(r.id)} className="flex items-center gap-2 mx-auto px-3 py-2 text-blue-600 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-800 text-sm">
                            {expRows.has(r.id) ? <><ChevronUp className="w-4 h-4" /> Ẩn</> : <><ChevronDown className="w-4 h-4" /> Xem</>}
                          </button>
                        </td>
                      </tr>
                      {expRows.has(r.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="p-0">
                            <div className="p-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><User className="w-4 h-4 text-blue-600" /> Thông tin cơ bản</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><span className="font-medium text-gray-600">Mã học sinh:</span> HS{String(r.student_id).padStart(6, '0')}</p>
                                  <p><span className="font-medium text-gray-600">Ngày phát hiện:</span> {fmtDate(r.detect_date)}</p>
                                  <p><span className="font-medium text-gray-600">Ngày tạo:</span> {fmtDate(r.created_at)}</p>
                                  <p><span className="font-medium text-gray-600">Lớp:</span> {r.class_name || 'Không xác định'}</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Activity className="w-4 h-4 text-green-600" /> Thông tin bệnh</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><span className="font-medium text-gray-600">Tên bệnh:</span> {r.disease_name || 'Không xác định'}</p>
                                  <p><span className="font-medium text-gray-600">Loại bệnh:</span> {r.disease_category || 'Không xác định'}</p>
                                  <p><span className="font-medium text-gray-600">Chẩn đoán:</span> {r.diagnosis || 'Chưa có chẩn đoán'}</p>
                                  <p><span className="font-medium text-gray-600">Mô tả bệnh:</span> {r.description || 'Không có'}</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /> Điều trị & Tiêm chủng</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><span className="font-medium text-gray-600">Ngày khỏi:</span> {fmtDate(r.cure_date)}</p>
                                  <p><span className="font-medium text-gray-600">Nơi điều trị:</span> {r.location_cure || 'Không có'}</p>
                                  <p><span className="font-medium text-gray-600">Chuyển đến:</span> {r.transferred_to || 'Không chuyển viện'}</p>
                                  <p><span className="font-medium text-gray-600">Cần vaccine:</span> {r.vaccine_need ? 'Có' : 'Không'}</p>
                                  <p><span className="font-medium text-gray-600">Số liều:</span> {r.dose_quantity || 'Không xác định'}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">Hiển thị {first + 1} - {Math.min(last, filtRecs.length)} của {filtRecs.length} hồ sơ</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm">Trước</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return <button key={p} onClick={() => setPage(p)} className={`px-3 py-2 rounded-lg text-sm ${page === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{p}</button>;
                })}
              </div>
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm">Sau</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecordList;